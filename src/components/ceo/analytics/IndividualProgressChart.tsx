
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { User, TrendingUp, TrendingDown, Minus, Award, Users } from "lucide-react";
import type { Activity } from "@/hooks/useActivities";
import type { Profile } from "@/types/user";

interface IndividualProgressChartProps {
  employees: Profile[];
  activities: Activity[];
  timeRange: "week" | "month" | "quarter";
}

export const IndividualProgressChart = ({ employees, activities, timeRange }: IndividualProgressChartProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);

  // Process individual employee data
  const processEmployeeData = () => {
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
      const trend = secondHalfAvg > firstHalfAvg ? 'up' : 
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

  // Process daily progress for selected employee
  const processEmployeeProgress = (employee: Profile) => {
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

  const employeeData = processEmployeeData();
  const topPerformers = employeeData.slice(0, 3);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Employees with the highest activity submissions this {timeRange}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((employee, index) => (
              <div key={employee.id} className="relative">
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                )}
                <Card className="border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedEmployee(employee)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {employee.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{employee.name}</h4>
                        <p className="text-sm text-slate-600">{employee.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {employee.totalActivities} activities
                          </Badge>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTrendColor(employee.trend)}`}>
                            {getTrendIcon(employee.trend)}
                            {employee.trendPercentage.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Performance List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              All Employees
            </CardTitle>
            <CardDescription>
              Click on any employee to view detailed progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {employeeData.map((employee) => (
                <div
                  key={employee.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEmployee?.id === employee.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                        {employee.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-800">{employee.name}</p>
                      <p className="text-sm text-slate-600">{employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {employee.totalActivities}
                    </Badge>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTrendColor(employee.trend)}`}>
                      {getTrendIcon(employee.trend)}
                      {employee.trendPercentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Individual Progress Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Individual Progress
            </CardTitle>
            <CardDescription>
              {selectedEmployee 
                ? `${selectedEmployee.name}'s activity progress over time`
                : 'Select an employee to view their progress'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEmployee ? (
              <div>
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {selectedEmployee.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-slate-800">{selectedEmployee.name}</h4>
                      <p className="text-sm text-slate-600">{selectedEmployee.department}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Total Activities</p>
                      <p className="text-lg font-semibold text-blue-600">{selectedEmployee.totalActivities}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Last Activity</p>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedEmployee.lastActivity ? 
                          new Date(selectedEmployee.lastActivity).toLocaleDateString() : 
                          'No activities'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={processEmployeeProgress(selectedEmployee)}>
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
                      dataKey="activities" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                      name="Daily Activities"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Cumulative"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-500">
                <div className="text-center">
                  <User className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p>Select an employee from the list to view their detailed progress</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
