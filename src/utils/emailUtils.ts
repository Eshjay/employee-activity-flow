
import { useToast } from "@/hooks/use-toast";

export const sendEmailReminder = (emails: string[], subject: string, content: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate email sending
    setTimeout(() => {
      console.log('Sending email reminder to:', emails);
      console.log('Subject:', subject);
      console.log('Content:', content);
      resolve(true);
    }, 1000);
  });
};

export const sendDailyReminders = async (): Promise<boolean> => {
  const pendingEmployees = [
    "john@company.com",
    "emma@company.com", 
    "mike@company.com"
  ];

  const subject = "Daily Activity Submission Reminder";
  const content = `
    Dear Team Member,
    
    This is a friendly reminder to submit your daily activity report.
    
    Please log into the Activity Tracker system and complete your submission for today.
    
    If you have any questions, please contact your supervisor.
    
    Best regards,
    Activity Tracker System
  `;

  return await sendEmailReminder(pendingEmployees, subject, content);
};

export const sendWeeklyReport = async (emails: string[]): Promise<boolean> => {
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
};
