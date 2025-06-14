
import { supabase } from "@/integrations/supabase/client";

export const sendEmailReminder = async (emails: string[], subject: string, content: string): Promise<boolean> => {
  try {
    // This is a placeholder for direct email sending
    // In practice, you'd want to create a specific edge function for this
    console.log('Sending email reminder to:', emails);
    console.log('Subject:', subject);
    console.log('Content:', content);
    return true;
  } catch (error) {
    console.error('Error sending email reminder:', error);
    return false;
  }
};

export const sendDailyReminders = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-daily-reminders');
    
    if (error) {
      console.error('Error sending daily reminders:', error);
      return false;
    }
    
    console.log('Daily reminders result:', data);
    return data.success;
  } catch (error) {
    console.error('Error calling daily reminders function:', error);
    return false;
  }
};

export const sendWeeklyReport = async (emails: string[]): Promise<boolean> => {
  try {
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
