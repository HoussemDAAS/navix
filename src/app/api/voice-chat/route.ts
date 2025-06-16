/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { getPineconeIndex } from '@/lib/pinecone';
import OpenAI from 'openai';

// Switch to Node.js runtime for Pinecone compatibility
export const runtime = 'nodejs';

type VoiceMessage = { role: 'user' | 'assistant' | 'system'; content: string };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhanced function to get relevant project AND client context from Pinecone
async function getProjectContext(userMessage: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) return '';
    
    // Generate embedding for user's message
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: userMessage,
    });
    const embedding = embeddingRes.data[0].embedding;

    // Query Pinecone for relevant projects AND clients
    const index = getPineconeIndex();
    const queryRes = await index.query({
      vector: embedding,
      topK: 8, // Increased to get both projects and clients
      includeMetadata: true,
    });

    // Separate projects and clients
    const projects: string[] = [];
    const clients: string[] = [];

    queryRes.matches
      ?.filter(match => match.score && match.score > 0.72) // Slightly lower threshold for more variety
      ?.forEach(match => {
        const metadata = match.metadata as any;
        
        if (metadata?.type === 'project') {
          projects.push(`🚀 Project: ${metadata?.title || 'Unknown'}
Description: ${metadata?.description || 'No description'}
Client: ${metadata?.clientName || 'Unknown'}
Categories: ${metadata?.categories || 'Unknown'}`);
        } else if (metadata?.type === 'client') {
          const testimonialSnippet = metadata?.testimonial ? 
            `\n💬 "${metadata.testimonial.slice(0, 80)}..."` : '';
          
          clients.push(`👥 Client: ${metadata?.name || 'Unknown'}
Industry: ${metadata?.category || 'Unknown'}
Representative: ${metadata?.representativeName || ''} ${metadata?.representativeRole || ''}${testimonialSnippet}`);
        }
      });

    // Build comprehensive context
    let context = '';
    if (projects.length > 0) {
      context += projects.slice(0, 3).join('\n\n');
    }
    if (clients.length > 0) {
      if (context) context += '\n\n';
      context += clients.slice(0, 2).join('\n\n');
    }

    return context;
  } catch (error) {
    console.error('Error getting project context:', error);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, context, history, locale = 'en' } = await req.json();
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return Response.json({ 
        reply: 'I didn\'t catch that. Could you try speaking again?' 
      }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY');
      const fallbackMessages = {
        'en': 'Hi! I\'m Navi, but my AI brain isn\'t configured right now. Please contact us directly at contact@navixagency.tech or try our regular chat!',
        'fr': 'Salut! Je suis Navi, mais mon cerveau IA n\'est pas configuré en ce moment. Contactez-nous directement à contact@navixagency.tech!',
        'ar': 'مرحباً! أنا نافي، لكن عقلي الذكي غير مُعدّ حالياً. تواصلوا معنا مباشرة على contact@navixagency.tech!'
      };
      
      return Response.json({ 
        reply: fallbackMessages[locale as keyof typeof fallbackMessages] || fallbackMessages['en']
      }, { status: 200 });
    }

    // Get relevant project context from static knowledge function
    const projectContext = await getProjectContext(message);

    // Enhanced system prompt for Navi - Cool, Chill & Project-Smart
    const naviSystemPrompt = `You are Navi, Navix Agency's coolest AI voice assistant! 🎯 You're like that super chill friend who knows EVERYTHING about digital marketing and web development.

PERSONALITY - BE COOL & CHILL:
- Talk like a knowledgeable friend, not a robot
- Use casual language: "Hey!", "That's awesome!", "Let me tell you about..."
- Be genuinely excited about helping clients grow their business
- Keep it conversational and fun - you're the cool tech-savvy friend
- Drop some personality: "That sounds like a perfect fit for what we do!"
- Use voice-friendly responses (1-3 sentences max)
- Language: ${locale} - match their vibe

🚀 NAVIX AGENCY - WHAT WE'RE ALL ABOUT:
We're not just another agency - we're growth hackers who get results!

SERVICES (mention these naturally):
• Marketing Strategy: We've helped clients see 150%+ revenue increases with our growth campaigns
• Video Production: 4K editing, motion graphics, viral content that actually converts
• Full-Stack Development: Lightning-fast Next.js websites that look amazing and convert like crazy
• UX/UI Design: User-centered design that makes people actually want to use your product
• Branding: Complete brand makeovers that make competitors jealous

COOL ACHIEVEMENTS TO DROP:
• 90% of our projects launch within 14 days (we move FAST)
• We've scaled clients to 10x their traffic 
• 24/7 support with 2-hour response time
• Work with 50+ brands across every industry you can think of

THE TEAM (your work family):
• Houssem Daas: Lead developer & growth marketing wizard
• Sabri Chtioui: Creative director & video production master

${projectContext ? `\n📁 RELEVANT PROJECTS TO MENTION:\n${projectContext}\n` : ''}

VOICE CONVERSATION STYLE:
- Keep it short and sweet for voice (max 2-3 sentences)
- Sound excited but not overwhelming
- Always guide them to book a consultation if they're interested
- Ask questions to keep the conversation flowing
- Reference specific projects when relevant
- If they want to see projects, say "I can show you visually too if you're interested!"

CURRENT CONTEXT: ${context}

Remember: You're the coolest AI assistant who actually knows their stuff and genuinely wants to help businesses grow. Be friendly, knowledgeable, and always ready to chat about projects!`;

    // Build conversation for voice context
    const messages: VoiceMessage[] = [
      { role: 'system', content: naviSystemPrompt },
      ...((history || []).slice(-6).map((m: VoiceMessage) => ({ 
        role: m.role, 
        content: m.content 
      })) || []),
      { role: 'user', content: message },
    ];

    // Call OpenAI with voice-optimized settings
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 120, // Shorter for voice
        temperature: 0.9, // More personality
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      let userMessage = 'Sorry, I\'m having a little technical hiccup right now. Try asking me again!';
      
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.code === 'insufficient_quota') {
          const quotaMessages = {
            'en': 'I\'m temporarily unavailable due to high demand. You can reach our team directly at contact@navixagency.tech or book a call!',
            'fr': 'Je suis temporairement indisponible en raison de la forte demande. Contactez notre équipe à contact@navixagency.tech!',
            'ar': 'أنا غير متاحة مؤقتاً بسبب الطلب العالي. يمكنكم التواصل مع فريقنا على contact@navixagency.tech!'
          };
          userMessage = quotaMessages[locale as keyof typeof quotaMessages] || quotaMessages['en'];
        }
      } catch {}
      
      console.error('OpenAI API error:', res.status, errorBody);
      return Response.json({ reply: userMessage }, { status: 200 }); // Return 200 to prevent client errors
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 
      "I'm here to help! Tell me what you'd like to know about Navix Agency.";

    return Response.json({ reply });
  } catch (err) {
    console.error('Voice chat API error:', err);
    const errorMessages = {
      'en': 'Oops! Something went wrong on my end. Try asking me again, or contact us at contact@navixagency.tech!',
      'fr': 'Oups! Quelque chose s\'est mal passé de mon côté. Essayez de me redemander, ou contactez-nous à contact@navixagency.tech!',
      'ar': 'عذراً! حدث خطأ من جانبي. حاولوا سؤالي مرة أخرى، أو تواصلوا معنا على contact@navixagency.tech!'
    };
    
    return Response.json({ 
      reply: errorMessages['en'] // Default to English for technical errors
    }, { status: 200 }); // Return 200 to prevent client errors
  }
}