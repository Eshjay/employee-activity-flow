
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import type { Activity } from "@/hooks/useActivities";
import type { Profile } from "@/types/user";

interface SubmissionPatternChartProps {
  activities: Activity[];
  timeRange: "week" | "month" | "quarter";
}

export const SubmissionPatternChart = ({ activities, timeRange }: SubmissionPatternChartProps) => {
  // Process data based on time range
  const processSubmissionData = () => {
    const now = new Date();
    let days = 7;
    
    switch (timeRange) {
      case "week":
        days = 7;
        break;
      case "month":
        days = 30;
        break;
      case "quarter":
        days = 90;
        break;
    }

    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = activities.filter(activity => activity.date === dateStr);
      
      data.push({
        date: timeRange === "week" ? 
          date.toLocaleDateString('en-US', { weekday: 'short' }) :
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        submissions: dayActivities.length,
        uniqueUsers: new Set(dayActivities.map(a => a.user_id)).size
      });
    }
    
    return data;
  };

  // Process hourly distribution
  const processHourlyData = () => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      submissions: 0
    }));

    activities.forEach(activity => {
      if (activity.time_started) {
        const hour = parseInt(activity.time_started.split(':')[0]);
        if (hour >= 0 && hour < 24) {
          hourlyData[hour].submissions++;
        }
      }
    });

    return hourlyData;
  };

  const dailyData = processSubmissionData();
  const hourlyData = processHourlyData();

  const totalSubmissions = dailyData.reduce((sum, day) => sum + day.submissions, 0);
  const avgPerDay = totalSubmissions / dailyData.length;
  const peakDay = dailyData.reduce((peak, day) => 
    day.submissions > peak.submissions ? day : peak, dailyData[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Submission Trend */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Daily Submission Trend
          </CardTitle>
          <CardDescription>
            Submissions over the last {timeRange === "week" ? "7 days" : timeRange === "month" ? "30 days" : "90 days"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Average per day</p>
              <p className="text-xl font-semibold text-blue-600">{avgPerDay.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-slate-600">Peak day</p>
              <p className="text-xl font-semibold text-green-600">{peakDay?.submissions || 0}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="submissions" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="uniqueUsers" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Distribution */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Hourly Distribution
          </CardTitle>
          <CardDescription>
            When employees typically submit their activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Peak hour</p>
              <p className="text-xl font-semibold text-green-600">
                {hourlyData.reduce((peak, hour) => 
                  hour.submissions > peak.submissions ? hour : peak).hour}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Business hours (9-17)</p>
              <p className="text-xl font-semibold text-blue-600">
                {hourlyData.slice(9, 17).reduce((sum, hour) => sum + hour.submissions, 0)}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="hour" 
                stroke="#64748b"
                fontSize={10}
                interval={2}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar 
                dataKey="submissions" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
