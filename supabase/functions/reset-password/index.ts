
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Token and new password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify reset token
    const { data: resetToken } = await supabaseClient
      .from('password_reset_tokens')
      .select('user_id, expires_at, used_at')
      .eq('token', token)
      .single()

    if (!resetToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired reset token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (resetToken.used_at) {
      return new Response(
        JSON.stringify({ error: 'Reset token has already been used' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Reset token has expired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update user password using admin client
    const { error: passwordError } = await supabaseClient.auth.admin.updateUserById(
      resetToken.user_id,
      { password: newPassword }
    )

    if (passwordError) {
      console.error('Error updating password:', passwordError)
      return new Response(
        JSON.stringify({ error: 'Failed to update password' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Mark token as used
    await supabaseClient
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    return new Response(
      JSON.stringify({ success: true, message: 'Password has been reset successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error resetting password:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
