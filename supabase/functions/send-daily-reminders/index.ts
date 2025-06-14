
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get employees who haven't submitted activities today
    const today = new Date().toISOString().split('T')[0]
    
    const { data: employeesWithoutActivities } = await supabaseClient
      .from('profiles')
      .select('id, name, email')
      .eq('role', 'employee')
      .eq('status', 'active')
      .not('id', 'in', `(
        SELECT DISTINCT user_id 
        FROM activities 
        WHERE date = '${today}'
      )`)

    if (!employeesWithoutActivities || employeesWithoutActivities.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No employees need reminders today',
          remindersSent: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send reminder emails
    const emailPromises = employeesWithoutActivities.map(async (employee) => {
      try {
        const emailResponse = await resend.emails.send({
          from: 'Activity Tracker <noreply@yourdomain.com>',
          to: [employee.email],
          subject: 'Daily Activity Submission Reminder',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">Activity Tracker</h1>
              <h2 style="color: #2563eb;">Daily Activity Reminder</h2>
              
              <p>Hello ${employee.name},</p>
              
              <p>This is a friendly reminder to submit your daily activity report for today.</p>
              
              <p>Please log into the Activity Tracker system and complete your submission.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${req.headers.get('origin')}" 
                   style="background-color: #2563eb; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          display: inline-block;
                          font-weight: bold;">
                  Submit Your Activity
                </a>
              </div>
              
              <p>If you have any questions, please contact your supervisor.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 14px; color: #6b7280;">
                Best regards,<br>
                Activity Tracker System
              </p>
            </div>
          `,
        })
        return { employee: employee.email, success: true, emailId: emailResponse.data?.id }
      } catch (error) {
        console.error(`Error sending reminder to ${employee.email}:`, error)
        return { employee: employee.email, success: false, error: error.message }
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`Daily reminders sent: ${successCount} successful, ${failureCount} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Daily reminders sent successfully`,
        remindersSent: successCount,
        failures: failureCount,
        results: results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending daily reminders:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send daily reminders' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
