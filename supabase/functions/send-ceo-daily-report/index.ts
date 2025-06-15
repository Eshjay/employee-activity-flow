
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
// We assume SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, and RESEND_API_KEY are set

const resend = new Resend(resendApiKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Connect to Supabase using Service Role for full access
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Get CEO email from system_settings
    const { data: settingData, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'ceo_email')
      .maybeSingle();

    if (settingsError || !settingData) {
      throw new Error('Unable to find CEO email setting');
    }
    const ceoEmail = settingData.value;

    // 3. Generate daily report data - For demo, let's get today's activity summary
    const today = new Date().toISOString().split('T')[0];
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, title, description, user_id, date')
      .eq('date', today);

    if (activitiesError) {
      throw new Error(`Unable to fetch today's activities: ${activitiesError.message}`);
    }
    const activityCount = activities.length;
    // Optionally, aggregate more data as needed

    // 4. Compose the email (Summary)
    const emailSubject = `Daily Activity Report - ${today}`;
    let emailHtml = `
      <h1>Daily Activity Report (${today})</h1>
      <p>Total Activities Submitted: <b>${activityCount}</b></p>
      <ul>
        ${activities
          .map(
            (a: any) =>
              `<li><strong>${a.title}</strong> – ${a.description || ''}</li>`
          )
          .join('')}
      </ul>
      <p>Sent by Activity Tracker System.</p>
    `;

    // 5. Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: 'Activity Tracker <onboarding@resend.dev>',
      to: [ceoEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailResponse.error) {
      throw new Error(
        `Failed to send email: ${emailResponse.error.message || emailResponse.error}`
      );
    }

    // 6. Respond OK
    return new Response(
      JSON.stringify({ success: true, message: "Report sent", ceoEmail, sentActivities: activityCount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-ceo-daily-report:", error);
    return new Response(
      JSON.stringify({ error: error?.message || String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
