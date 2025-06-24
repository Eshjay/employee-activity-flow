
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

    if (!email || !name || !role || !department || !invitedBy) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

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
        JSON.stringify({ error: 'Failed to create invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create signup link
    const signupLink = `${req.headers.get('origin')}/auth?mode=signup&email=${encodeURIComponent(email)}&token=${invitationToken}`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: 'Activity Tracker <onboarding@resend.dev>',
      to: [email],
      subject: 'You\'re Invited to Join Activity Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Activity Tracker</h1>
          <h2 style="color: #2563eb;">You're Invited!</h2>
          
          <p>Hello ${name},</p>
          
          <p>You've been invited to join Activity Tracker as a <strong>${role}</strong> in the <strong>${department}</strong> department.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signupLink}" 
               style="background-color: #2563eb; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      display: inline-block;
                      font-weight: bold;">
              Complete Your Registration
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
            ${signupLink}
          </p>
          
          <p><strong>Important:</strong> This invitation will expire in 7 days.</p>
          
          <p>If you have any questions, please contact your administrator.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 14px; color: #6b7280;">
            Best regards,<br>
            The Activity Tracker Team
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
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
