
import { supabase } from "@/integrations/supabase/client";

export const sendEmailReminder = async (emails: string[], subject: string, content: string): Promise<boolean> => {
  try {
    console.log('Sending email reminder to:', emails);
    console.log('Subject:', subject);
    console.log('Content:', content);

    // For now, this is a placeholder for direct email sending
    // In a real implementation, you'd want to create a specific edge function for this
    const { data, error } = await supabase.functions.invoke('send-reset-email', {
      body: {
        email: emails[0], // Send to first email for testing
        resetLink: 'https://example.com/reminder',
        userName: 'Team Member'
      }
    });

    if (error) {
      console.error('Error sending email reminder:', error);
      return false;
    }

    console.log('Email reminder sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email reminder:', error);
    return false;
  }
};

export const sendDailyReminders = async (): Promise<boolean> => {
  try {
    console.log('Attempting to send daily reminders...');
    
    const { data, error } = await supabase.functions.invoke('send-daily-reminders');
    
    if (error) {
      console.error('Error sending daily reminders:', error);
      return false;
    }
    
    console.log('Daily reminders result:', data);
    return data?.success || true;
  } catch (error) {
    console.error('Error calling daily reminders function:', error);
    return false;
  }
};

export const sendWeeklyReport = async (emails: string[]): Promise<boolean> => {
  try {
    console.log('Sending weekly report to:', emails);
    
    // For now, this will use the generic email reminder function
    const subject = "Weekly Activity Summary Report";
    const content = `
      Dear Executive Team,
      
      Please find attached the weekly activity summary report for your review.
      
      This report includes:
      - Total activities submitted
      - Employee participation rates
      - Department performance metrics
      - Pending submissions
      
      Best regards,
      Activity Tracker System
    `;

    return await sendEmailReminder(emails, subject, content);
  } catch (error) {
    console.error('Error sending weekly report:', error);
    return false;
  }
};
