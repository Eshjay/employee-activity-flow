
import type { Activity } from "@/hooks/useActivities";
import type { Profile } from "@/types/user";
import type { ExtendedEmployeeData, ProgressDataPoint } from "./types";

export const processEmployeeData = (employees: Profile[], activities: Activity[]): ExtendedEmployeeData[] => {
  return employees.map(employee => {
    const employeeActivities = activities.filter(activity => activity.user_id === employee.id);
    
    // Calculate trend (comparing first half vs second half of period)
    const sortedActivities = employeeActivities.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const midPoint = Math.floor(sortedActivities.length / 2);
    const firstHalf = sortedActivities.slice(0, midPoint);
    const secondHalf = sortedActivities.slice(midPoint);
    
    const firstHalfAvg = firstHalf.length;
    const secondHalfAvg = secondHalf.length;
    const trend: 'up' | 'down' | 'stable' = secondHalfAvg > firstHalfAvg ? 'up' : 
                 secondHalfAvg < firstHalfAvg ? 'down' : 'stable';
    const trendPercentage = firstHalfAvg > 0 ? 
      ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100) : 0;
    
    return {
      ...employee,
      totalActivities: employeeActivities.length,
      trend,
      trendPercentage: Math.abs(trendPercentage),
      lastActivity: employeeActivities.length > 0 ? 
        employeeActivities.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0].date : null,
      activities: employeeActivities
    };
  }).sort((a, b) => b.totalActivities - a.totalActivities);
};

export const processEmployeeProgress = (
  employee: ExtendedEmployeeData, 
  activities: Activity[], 
  timeRange: "week" | "month" | "quarter"
): ProgressDataPoint[] => {
  const now = new Date();
  let days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
  
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayActivities = activities.filter(activity => 
      activity.user_id === employee.id && activity.date === dateStr
    );
    
    data.push({
      date: timeRange === "week" ? 
        date.toLocaleDateString('en-US', { weekday: 'short' }) :
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      activities: dayActivities.length,
      cumulative: data.length > 0 ? 
        data[data.length - 1].cumulative + dayActivities.length : 
        dayActivities.length
    });
  }
  
  return data;
};

export const getTrendIcon = (trend: string) => {
  const { TrendingUp, TrendingDown, Minus } = require('lucide-react');
  
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-gray-500" />;
  }
};

export const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'down':
      return 'text-red-600 bg-red-100 border-red-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};
