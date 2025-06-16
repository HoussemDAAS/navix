import { NextRequest } from 'next/server';

export const runtime = 'edge';

type ConversationMessage = { 
  role: 'user' | 'assistant' | 'system'; 
  content: string; 
};

type ConversationState = {
  category: string;
  questionCount: number;
  isComplete: boolean;
  userResponses: Record<string, string>;
};

// Language-specific system prompts
const getSystemPrompt = (locale: string, state: ConversationState) => {
  const languageInstructions = {
    'en': 'Respond in English.',
    'fr': 'Répondez en français. Soyez naturel et conversationnel.',
    'ar': 'أجب باللغة العربية. كن طبيعياً ومحادثاً.'
  };

  const languageInstruction = languageInstructions[locale as keyof typeof languageInstructions] || languageInstructions['en'];

  return `You are Navix's AI project consultant. Your job is to guide users through a smart, conversational contact form that feels natural and helpful. ${languageInstruction}

SERVICES AVAILABLE:
- Marketing Strategy: Growth marketing, campaigns, media buying, analytics
- Video Editing: Video production, editing, motion graphics, storytelling
- Development: Web development, full-stack solutions, e-commerce, apps
- UX/UI: User experience design, interface design, prototyping, user research
- Branding: Brand identity, logos, visual systems, brand strategy

CONVERSATION RULES:
1. Ask MAX 6 questions total
2. Questions should be SHORT, friendly, and conversational
3. Adapt questions based on the chosen service and previous answers
4. Each question should gather specific project details
5. Keep responses under 40 words
6. End with a project summary and meeting invitation
7. IMPORTANT: Always respond in the user's language (${locale})

QUESTION PROGRESSION EXAMPLE:
For "Development" service:
- English: "What type of product are you building?"
- French: "Quel type de produit développez-vous ?"
- Arabic: "ما نوع المنتج الذي تطوره؟"

Then create a summary like: 
- English: "You're planning to build a [product type] for [audience] with [key features]. Timeline: [timeline]. This sounds like an exciting project! Ready to schedule a quick call to discuss the details?"
- French: "Vous prévoyez de construire un [type de produit] pour [audience] avec [fonctionnalités clés]. Chronologie: [chronologie]. Cela semble être un projet passionnant ! Prêt à programmer un appel rapide pour discuter des détails ?"
- Arabic: "تخطط لبناء [نوع المنتج] لـ [الجمهور] مع [الميزات الرئيسية]. الجدول الزمني: [الجدول الزمني]. يبدو هذا مشروعاً مثيراً! هل أنت مستعد لجدولة مكالمة سريعة لمناقشة التفاصيل؟"

CURRENT STATE: ${JSON.stringify(state)}

Be conversational, friendly, and focus on getting actionable project details. If this is question 6 or the user seems ready, provide a summary and suggest scheduling a call.`;
};

export async function POST(req: NextRequest) {
  let conversationState: ConversationState | undefined;
  
  try {
    const { message, history, conversationState: reqConversationState, locale = 'en' } = await req.json();
    conversationState = reqConversationState;
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY');
      const fallbackMessages = {
        'en': 'AI is not configured. Please contact us directly at contact@navixagency.tech',
        'fr': 'IA non configurée. Veuillez nous contacter directement à contact@navixagency.tech',
        'ar': 'الذكاء الاصطناعي غير مُعدّ. يرجى التواصل معنا مباشرة على contact@navixagency.tech'
      };
      
      return Response.json({ 
        reply: fallbackMessages[locale as keyof typeof fallbackMessages] || fallbackMessages['en'], 
        conversationState: conversationState,
        isComplete: false 
      }, { status: 200 });
    }

    const state: ConversationState = conversationState || {
      category: '',
      questionCount: 0,
      isComplete: false,
      userResponses: {}
    };

    // Get language-specific system prompt
    const systemPrompt = getSystemPrompt(locale, state);

    // Build conversation history for context
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
      ...((history || []).map((m: ConversationMessage) => ({ 
        role: m.role, 
        content: m.content 
      })) || []),
      { role: 'user', content: message },
    ];

    // Call OpenAI API
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      let userMessage = `AI service error: ${res.status}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.code === 'insufficient_quota') {
          const quotaMessages = {
            'en': 'Our AI assistant is temporarily unavailable. Please contact us directly at contact@navixagency.tech or book a call below.',
            'fr': 'Notre assistant IA est temporairement indisponible. Veuillez nous contacter directement à contact@navixagency.tech ou réserver un appel ci-dessous.',
            'ar': 'مساعدنا الذكي غير متاح مؤقتاً. يرجى التواصل معنا مباشرة على contact@navixagency.tech أو احجز مكالمة أدناه.'
          };
          userMessage = quotaMessages[locale as keyof typeof quotaMessages] || quotaMessages['en'];
        } else if (parsed?.error?.message) {
          userMessage = parsed.error.message;
        }
      } catch {}
      console.error('OpenAI API error:', res.status, errorBody);
      return Response.json({ 
        reply: userMessage, 
        conversationState: state,
        isComplete: false 
      }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';

    // Update conversation state
    const newState = {
      ...state,
      questionCount: state.questionCount + 1,
      isComplete: state.questionCount >= 5 || reply.toLowerCase().includes('schedule') || reply.toLowerCase().includes('call') || reply.toLowerCase().includes('programmer') || reply.toLowerCase().includes('جدولة'),
      userResponses: {
        ...state.userResponses,
        [`question_${state.questionCount + 1}`]: message
      }
    };

    return Response.json({ 
      reply,
      conversationState: newState,
      isComplete: newState.isComplete
    });
  } catch (err) {
    console.error('API /api/contact-conversation error:', err);
    const errorMessages = {
      'en': 'Sorry, something went wrong. Please try again or contact us directly.',
      'fr': 'Désolé, quelque chose s\'est mal passé. Veuillez réessayer ou nous contacter directement.',
      'ar': 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.'
    };
    
    return Response.json({ 
      reply: errorMessages['en'], // Default to English for errors
      conversationState: conversationState || {},
      isComplete: false
    }, { status: 500 });
  }
}