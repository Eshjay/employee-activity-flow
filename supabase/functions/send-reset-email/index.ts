
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, resetLink, userName } = await req.json()

    console.log('Attempting to send reset email to:', email)
    console.log('Reset link provided:', !!resetLink)
    console.log('RESEND_API_KEY configured:', !!Deno.env.get('RESEND_API_KEY'))

    if (!email || !resetLink) {
      return new Response(
        JSON.stringify({ error: 'Email and reset link are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!Deno.env.get('RESEND_API_KEY')) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use a verified domain or the account owner's email for testing
    const fromEmail = Deno.env.get('VERIFIED_SENDER_EMAIL') || 'onboarding@resend.dev';
    const appName = 'Allure CV Signatures';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; font-size: 28px; margin: 0;">${appName}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #3b82f6, #1d4ed8); margin: 10px auto; width: 60px;"></div>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
            Hello ${userName || 'there'},
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
            We received a request to reset your password for your ${appName} account. If you made this request, please click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              Reset Your Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 10px 0; word-break: break-all; font-family: monospace; font-size: 13px; color: #374151;">
            ${resetLink}
          </div>
        </div>
        
        <div style="background-color: #fef3cd; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
            ⚠️ Important: This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 20px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="text-align: center;">
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px 0;">
            Best regards,<br>
            <strong>The ${appName} Team</strong>
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    console.log('Sending email with from address:', fromEmail);

    const emailResponse = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [email],
      subject: `Password Reset Request - ${appName}`,
      html: emailHtml,
    })

    console.log('Password reset email result:', {
      success: !emailResponse.error,
      emailId: emailResponse.data?.id,
      error: emailResponse.error?.message
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error)
      
      // Check if it's a domain verification error
      if (emailResponse.error.message && emailResponse.error.message.includes('domain')) {
        return new Response(
          JSON.stringify({ 
            error: 'Email domain not verified. Please contact the system administrator.',
            details: emailResponse.error.message
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: `Failed to send email: ${emailResponse.error.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        emailId: emailResponse.data?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending password reset email:', error)
    return new Response(
      JSON.stringify({ error: `Failed to send password reset email: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
