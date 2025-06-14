
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import type { Activity } from "@/hooks/useActivities";
import type { Profile } from "@/types/user";

interface CompletionRatesChartProps {
  employees: Profile[];
  activities: Activity[];
  timeRange: "week" | "month" | "quarter";
}

export const CompletionRatesChart = ({ employees, activities, timeRange }: CompletionRatesChartProps) => {
  // Calculate completion rates over time
  const processCompletionData = () => {
    const now = new Date();
    let days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
    
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = activities.filter(activity => activity.date === dateStr);
      const uniqueSubmitters = new Set(dayActivities.map(a => a.user_id)).size;
      const completionRate = (uniqueSubmitters / employees.length) * 100;
      
      data.push({
        date: timeRange === "week" ? 
          date.toLocaleDateString('en-US', { weekday: 'short' }) :
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completionRate,
        submitted: uniqueSubmitters,
        total: employees.length,
        missing: employees.length - uniqueSubmitters
      });
    }
    
    return data;
  };

  // Calculate weekly patterns
  const processWeeklyPattern = () => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return weekdays.map(day => {
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate.toLocaleDateString('en-US', { weekday: 'long' }) === day;
      });
      
      const uniqueSubmitters = new Set(dayActivities.map(a => a.user_id)).size;
      const completionRate = (uniqueSubmitters / employees.length) * 100;
      
      return {
        day: day.substring(0, 3),
        completionRate,
        activities: dayActivities.length
      };
    });
  };

  // Calculate department completion rates
  const processDepartmentCompletion = () => {
    const departments = [...new Set(employees.map(e => e.department))];
    
    return departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptActivities = activities.filter(activity => 
        deptEmployees.some(emp => emp.id === activity.user_id)
      );
      
      const activeEmployees = deptEmployees.filter(emp => 
        deptActivities.some(activity => activity.user_id === emp.id)
      ).length;
      
      const completionRate = (activeEmployees / deptEmployees.length) * 100;
      
      return {
        department: dept,
        completionRate,
        active: activeEmployees,
        total: deptEmployees.length
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  };

  const completionData = processCompletionData();
  const weeklyPattern = processWeeklyPattern();
  const departmentCompletion = processDepartmentCompletion();

  // Calculate summary metrics
  const currentCompletionRate = completionData.length > 0 ? 
    completionData[completionData.length - 1].completionRate : 0;
  const avgCompletionRate = completionData.length > 0 ? 
    completionData.reduce((sum, day) => sum + day.completionRate, 0) / completionData.length : 0;
  const bestDay = weeklyPattern.reduce((best, day) => 
    day.completionRate > best.completionRate ? day : best, weeklyPattern[0]);
  const totalActiveEmployees = new Set(activities.map(a => a.user_id)).size;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Current Rate</p>
                <p className="text-2xl font-bold text-slate-800">{currentCompletionRate.toFixed(0)}%</p>
                <p className="text-sm text-green-600">Today's completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Average Rate</p>
                <p className="text-2xl font-bold text-slate-800">{avgCompletionRate.toFixed(0)}%</p>
                <p className="text-sm text-blue-600">This {timeRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-100">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Best Day</p>
                <p className="text-2xl font-bold text-slate-800">{bestDay?.day || 'N/A'}</p>
                <p className="text-sm text-amber-600">{bestDay?.completionRate.toFixed(0)}% completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-slate-800">{totalActiveEmployees}/{employees.length}</p>
                <p className="text-sm text-purple-600">Total participation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Completion Rate Trend
            </CardTitle>
            <CardDescription>
              Daily completion rates over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'completionRate' ? `${value.toFixed(1)}%` : value,
                    name === 'completionRate' ? 'Completion Rate' : name
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Pattern */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Weekly Completion Pattern
            </CardTitle>
            <CardDescription>
              Average completion rates by day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'completionRate' ? `${value.toFixed(1)}%` : value,
                    name === 'completionRate' ? 'Completion Rate' : 'Activities'
                  ]}
                />
                <Bar 
                  dataKey="completionRate" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Completion Rates */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            Department Completion Rates
          </CardTitle>
          <CardDescription>
            Completion rates across all departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentCompletion.map((dept, index) => (
              <div key={dept.department} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    dept.completionRate >= 80 ? 'bg-green-500' :
                    dept.completionRate >= 60 ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <h4 className="font-semibold text-slate-800">{dept.department}</h4>
                    <p className="text-sm text-slate-600">{dept.active}/{dept.total} employees active</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{dept.completionRate.toFixed(0)}%</p>
                    <p className="text-sm text-slate-600">completion rate</p>
                  </div>
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        dept.completionRate >= 80 ? 'bg-green-500' :
                        dept.completionRate >= 60 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${dept.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
