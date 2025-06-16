import { NextRequest } from 'next/server';

import { fetchProjects } from '@/services/projectService';

export const runtime = 'edge';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };



export async function POST(req: NextRequest) {
  try {
    const { message, history, locale, isVoiceChat, includeProjects } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY');
      return Response.json({ content: 'AI is not configured. Please contact the agency directly.' }, { status: 200 });
    }

    // Get fresh project data when requested
    let projectData = '';
    if (includeProjects) {
      try {
        const projects = await fetchProjects();
        const featuredProjects = projects.slice(0, 6);
        projectData = featuredProjects.map(p => 
          `• ${p.title}: ${p.description} (${p.categories?.join(', ') || 'General'})`
        ).join('\n');
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    }

    // Enhanced system prompt for voice interactions with project integration
    const systemPrompt = `You are Navi, a friendly and enthusiastic AI assistant for Navix Agency - a digital growth agency in Bizerte, Tunisia. ${
      isVoiceChat 
        ? 'You are having a VOICE conversation, so keep responses conversational, warm, and under 120 words. Use natural speech patterns.'
        : 'You are helping via text chat.'
    }

PERSONALITY:
- Warm, professional, genuinely excited about helping
- Expert in marketing, design, and development
- Passionate about showcasing Navix's work
- ${locale === 'ar' ? 'Respond in Arabic naturally' : locale === 'fr' ? 'Respond in French naturally' : 'Respond in English naturally'}

NAVIX AGENCY OVERVIEW:
🏢 LOCATION: Bizerte, Tunisia (Global reach)
👥 TEAM: Houssem (Software Engineer & Media Buyer) + Sabri (Video Editor & Designer)

🚀 SERVICES:
1. Growth Marketing Strategy - Data-driven campaigns, media buying, analytics
2. Full-Stack Web Development - Next.js, Shopify, conversion-optimized sites
3. Video Production - 4K editing, product showcases, social content
4. UX/UI Design - Conversion-focused, user research, design systems
5. Branding - Identity, logos, visual systems, strategy
6. Email Automation - Personalized campaigns, behavioral triggers

${includeProjects && projectData ? `
🏆 FEATURED PROJECTS:
${projectData}

When users ask about projects, examples, or our work, mention these specific projects! You can describe them and suggest they visit our projects page to see more details and case studies.
` : ''}

📞 CONTACT: contact@navixagency.tech | Free consultation available

${isVoiceChat ? `
VOICE CONVERSATION RULES:
- Keep under 120 words
- Use conversational tone
- Ask engaging questions
- Mention specific projects when relevant
- Suggest scheduling a call naturally
- If user wants to see projects, say "I can tell you about our work, or you can check out our projects page to see case studies and details"
` : ''}

GOAL: Help users understand how Navix can transform their business through our 360° digital growth solutions!`;

    // Detect if user is asking about projects or examples
    const projectKeywords = ['projects', 'work', 'examples', 'portfolio', 'case studies', 'clients', 'results'];
    const isAskingAboutProjects = projectKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    // Call OpenAI chat API
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...((history || []).map((m: ChatMessage) => ({ role: m.role, content: m.content })) || []),
          { role: 'user', content: message },
        ],
        max_tokens: isVoiceChat ? 150 : 300,
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      let userMessage = `AI service error: ${res.status}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.code === 'insufficient_quota') {
          userMessage = locale === 'ar' 
            ? 'مساعدتنا الذكية غير متاحة مؤقتاً. يرجى المحاولة لاحقاً أو التواصل معنا مباشرة.'
            : locale === 'fr'
            ? 'Notre assistant IA est temporairement indisponible. Veuillez réessayer plus tard ou nous contacter directement.'
            : 'Our AI assistant is temporarily unavailable. Please try again later or contact us directly.';
        }
      } catch {}
      console.error('OpenAI API error:', res.status, errorBody);
      return Response.json({ content: userMessage }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
    
    // Check for conversation ending keywords
    const goodbyeKeywords = ['goodbye', 'bye', 'thanks', 'thank you', 'that\'s all', 'end', 'stop', 'مع السلامة', 'شكرا', 'au revoir', 'merci'];
    const shouldEndConversation = goodbyeKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || reply.toLowerCase().includes(keyword)
    );

    return Response.json({ 
      content: reply,
      shouldEndConversation,
      includesProjects: isAskingAboutProjects && includeProjects
    });
  } catch (err) {
    console.error('API /api/chat error:', err);
    const errorMessage = locale === 'ar' 
      ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
      : locale === 'fr'
      ? 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
      : 'Sorry, something went wrong. Please try again.';
    return Response.json({ content: errorMessage }, { status: 500 });
  }
}