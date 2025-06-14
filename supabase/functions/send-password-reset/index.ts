
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
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
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

    // Check if user exists
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select('id, email, name')
      .eq('email', email)
      .single()

    if (!userProfile) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate reset token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

    // Store reset token
    await supabaseClient
      .from('password_reset_tokens')
      .insert({
        user_id: userProfile.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    // In a real application, you would send an email here
    // For now, we'll just log the reset link
    const resetLink = `${req.headers.get('origin')}/reset-password?token=${token}`
    console.log(`Password reset link for ${email}: ${resetLink}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.',
        // In development, we'll return the link
        resetLink: resetLink
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending password reset:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
