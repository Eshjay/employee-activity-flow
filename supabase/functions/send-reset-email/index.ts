
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
    console.log('Reset link:', resetLink)
    console.log('RESEND_API_KEY present:', !!Deno.env.get('RESEND_API_KEY'))

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

    const emailResponse = await resend.emails.send({
      from: 'Activity Tracker <onboarding@resend.dev>',
      to: [email],
      subject: 'Password Reset Request - Activity Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Activity Tracker</h1>
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          
          <p>Hello ${userName || 'there'},</p>
          
          <p>We received a request to reset your password for your Activity Tracker account. If you made this request, please click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #2563eb; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      display: inline-block;
                      font-weight: bold;">
              Reset Your Password
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
            ${resetLink}
          </p>
          
          <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 14px; color: #6b7280;">
            Best regards,<br>
            The Activity Tracker Team
          </p>
          
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    })

    console.log('Password reset email result:', emailResponse)

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error)
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
