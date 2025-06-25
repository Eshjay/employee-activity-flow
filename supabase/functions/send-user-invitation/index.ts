
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');

const resend = new Resend(resendApiKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, role, department, invitedBy } = await req.json();

    console.log('Processing invitation request:', { email, name, role, department, invitedBy });

    if (!email || !name || !role || !department || !invitedBy) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, name, role, department, invitedBy' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, status')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ 
          error: `A user with email ${email} already exists in the system.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation } = await supabase
      .from('email_invitations')
      .select('id, expires_at, used_at')
      .eq('email', email)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ 
          error: `There is already a pending invitation for ${email}. Please wait for it to expire or be used.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    console.log('Generated invitation token for:', email);

    // Store invitation in database
    const { data: invitation, error: invitationError } = await supabase
      .from('email_invitations')
      .insert({
        email,
        invited_by: invitedBy,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create signup link
    const signupLink = `${req.headers.get('origin')}/auth?mode=signup&email=${encodeURIComponent(email)}&token=${invitationToken}`;

    // Use a verified domain or the account owner's email for testing
    const fromEmail = Deno.env.get('VERIFIED_SENDER_EMAIL') || 'onboarding@resend.dev';
    const appName = 'Allure CV Signatures';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; font-size: 28px; margin: 0;">${appName}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #10b981, #059669); margin: 10px auto; width: 60px;"></div>
        </div>
        
        <div style="background-color: #f0fdf4; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 24px;">🎉 You're Invited!</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
            Hello ${name},
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
            You've been invited to join <strong>${appName}</strong> as a <strong>${role}</strong> in the <strong>${department}</strong> department.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signupLink}" 
               style="background: linear-gradient(135deg, #10b981, #059669);
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              Complete Your Registration
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 10px 0; word-break: break-all; font-family: monospace; font-size: 13px; color: #374151;">
            ${signupLink}
          </div>
        </div>
        
        <div style="background-color: #fef3cd; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
            ⏰ This invitation will expire in 7 days.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 20px;">
          If you have any questions about your account or need help getting started, please contact your administrator.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="text-align: center;">
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px 0;">
            Welcome to the team!<br>
            <strong>The ${appName} Team</strong>
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated invitation. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    console.log('Sending invitation email to:', email);

    const emailResponse = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [email],
      subject: `You're Invited to Join ${appName}`,
      html: emailHtml,
    });

    console.log('Invitation email result:', {
      success: !emailResponse.error,
      emailId: emailResponse.data?.id,
      error: emailResponse.error?.message
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      
      // Clean up the invitation record if email failed
      await supabase
        .from('email_invitations')
        .delete()
        .eq('id', invitation.id);
      
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
        JSON.stringify({ error: `Failed to send invitation email: ${emailResponse.error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        invitationId: invitation.id,
        emailId: emailResponse.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending user invitation:', error);
    return new Response(
      JSON.stringify({ error: `Failed to send invitation: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
