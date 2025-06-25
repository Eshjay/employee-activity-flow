
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, email } = await req.json();

    console.log('Verifying invitation:', { token: token?.substring(0, 8) + '...', email });

    if (!token || !email) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Token and email are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, clean up any expired invitations
    await supabase
      .from('email_invitations')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Verify invitation token
    const { data: invitation, error: invitationError } = await supabase
      .from('email_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('email', email)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    console.log('Invitation query result:', { 
      found: !!invitation, 
      error: invitationError?.message,
      invitationId: invitation?.id 
    });

    if (invitationError || !invitation) {
      // Check if invitation was already used
      const { data: usedInvitation } = await supabase
        .from('email_invitations')
        .select('used_at')
        .eq('invitation_token', token)
        .eq('email', email)
        .single();

      if (usedInvitation?.used_at) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'This invitation has already been used' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if invitation exists but is expired
      const { data: expiredInvitation } = await supabase
        .from('email_invitations')
        .select('expires_at')
        .eq('invitation_token', token)
        .eq('email', email)
        .single();

      if (expiredInvitation) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Invitation has expired. Please request a new invitation.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid invitation token or email address' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Invitation verified successfully');

    return new Response(
      JSON.stringify({ 
        valid: true, 
        invitation: {
          id: invitation.id,
          email: invitation.email,
          invitedBy: invitation.invited_by,
          expiresAt: invitation.expires_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying invitation:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Failed to verify invitation. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
