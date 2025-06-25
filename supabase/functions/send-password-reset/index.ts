
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

    console.log('Password reset request for:', email);

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

    // Clean up expired tokens first
    await supabaseClient
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Check if user exists
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, name')
      .eq('email', email)
      .single()

    console.log('User profile lookup:', { 
      found: !!userProfile, 
      error: profileError?.message 
    });

    if (!userProfile) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        }),
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

    console.log('Generated reset token for user:', userProfile.id);

    // Store reset token
    const { error: tokenError } = await supabaseClient
      .from('password_reset_tokens')
      .insert({
        user_id: userProfile.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset token. Please try again.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create reset link
    const resetLink = `${req.headers.get('origin')}/reset-password?token=${token}`

    // Send email using the send-reset-email function
    try {
      const emailResponse = await supabaseClient.functions.invoke('send-reset-email', {
        body: {
          email: userProfile.email,
          resetLink: resetLink,
          userName: userProfile.name
        }
      })

      console.log('Email sending result:', { 
        success: !emailResponse.error,
        error: emailResponse.error?.message 
      });

      if (emailResponse.error) {
        console.error('Error sending email:', emailResponse.error)
        // Continue with success response to not reveal if user exists
      } else {
        console.log('Password reset email sent successfully')
      }
    } catch (emailError) {
      console.error('Error calling email function:', emailError)
      // Still continue with success response
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.',
        // In development, we'll still return the link for testing
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { resetLink })
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending password reset:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error. Please try again later.' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
