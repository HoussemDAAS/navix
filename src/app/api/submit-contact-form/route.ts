import { NextRequest } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'edge';

type ContactInfo = {
  fullName: string;
  email: string;
  phone?: string;
};

type FormSubmission = {
  service: string;
  contactInfo: ContactInfo;
  conversationHistory: Array<{ question: string; answer: string }>;
  submittedAt: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const submission: FormSubmission = await req.json();
    
    // Format the conversation history for email
    const conversationText = submission.conversationHistory
      .map((item, index) => `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`)
      .join('\n\n');

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4083b7; border-bottom: 2px solid #4083b7; padding-bottom: 10px;">
          🎯 New Lead from AI Contact Form
        </h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Contact Information</h3>
          <p><strong>Full Name:</strong> ${submission.contactInfo.fullName}</p>
          <p><strong>Email:</strong> ${submission.contactInfo.email}</p>
          <p><strong>Phone/WhatsApp:</strong> ${submission.contactInfo.phone || 'Not provided'}</p>
          <p><strong>Service Interest:</strong> ${submission.service}</p>
          <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
        </div>

        <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">AI Conversation Details</h3>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.6; color: #555;">${conversationText}</pre>
        </div>

        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
          <p style="margin: 0; color: #1976d2;">
            <strong>Next Steps:</strong> Follow up within 24 hours for best conversion rates!
          </p>
        </div>
      </div>
    `;

    const emailText = `
New Lead from AI Contact Form

Contact Information:
- Name: ${submission.contactInfo.fullName}
- Email: ${submission.contactInfo.email}
- Phone/WhatsApp: ${submission.contactInfo.phone || 'Not provided'}
- Service Interest: ${submission.service}
- Submitted: ${new Date(submission.submittedAt).toLocaleString()}

Conversation Details:
${conversationText}
    `;

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'AI Contact Form <onboarding@resend.dev>', // Change this to your verified domain
        to: ['contact@navixagency.com'], // Change this to your email
        subject: `🎯 New ${submission.service} Lead - ${submission.contactInfo.fullName}`,
        html: emailHtml,
        text: emailText,
      });
    }

    return Response.json({ 
      success: true, 
      message: 'Form submitted successfully!' 
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return Response.json({ 
      success: false, 
      message: 'Sorry, something went wrong. Please try again or contact us directly.' 
    }, { status: 500 });
  }
}