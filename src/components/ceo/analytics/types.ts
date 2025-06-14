
import type { Activity } from "@/hooks/useActivities";
import type { Profile } from "@/types/user";

export interface IndividualProgressChartProps {
  employees: Profile[];
  activities: Activity[];
  timeRange: "week" | "month" | "quarter";
}

export interface ExtendedEmployeeData extends Profile {
  totalActivities: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  lastActivity: string | null;
  activities: Activity[];
}

export interface ProgressDataPoint {
  date: string;
  activities: number;
  cumulative: number;
}
