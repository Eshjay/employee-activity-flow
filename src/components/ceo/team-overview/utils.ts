
import type { Activity } from "@/hooks/useActivities";

export const getEmployeeStatus = (employeeId: string, activities: Activity[]) => {
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter(activity => 
    activity.user_id === employeeId && activity.date === today
  );
  
  if (todayActivities.length > 0) return "submitted";
  
  // Check if it's still early in the day (before 5 PM)
  const now = new Date();
  if (now.getHours() < 17) return "pending";
  
  return "missing";
};

export const getWeeklyActivityCount = (employeeId: string, activities: Activity[]) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return activities.filter(activity => 
    activity.user_id === employeeId && 
    new Date(activity.date) >= oneWeekAgo
  ).length;
};

export const getTodayActivityCount = (employeeId: string, activities: Activity[]) => {
  const today = new Date().toISOString().split('T')[0];
  return activities.filter(activity => 
    activity.user_id === employeeId && activity.date === today
  ).length;
};

export const getLastActivityDate = (employeeId: string, activities: Activity[]) => {
  const userActivities = activities
    .filter(activity => activity.user_id === employeeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return userActivities.length > 0 ? userActivities[0].date : 'No activities';
};
