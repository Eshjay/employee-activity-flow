
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

    if (!token || !email) {
      return new Response(
        JSON.stringify({ error: 'Token and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify invitation token
    const { data: invitation, error: invitationError } = await supabase
      .from('email_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('email', email)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid or expired invitation token' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        error: 'Failed to verify invitation' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
