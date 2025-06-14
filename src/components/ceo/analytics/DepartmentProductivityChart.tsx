
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Building2, Users, TrendingUp, Award } from "lucide-react";
import type { Activity } from "@/hooks/useActivities";
import type { Profile } from "@/types/user";

interface DepartmentProductivityChartProps {
  employees: Profile[];
  activities: Activity[];
  timeRange: "week" | "month" | "quarter";
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const DepartmentProductivityChart = ({ employees, activities, timeRange }: DepartmentProductivityChartProps) => {
  // Process department data
  const processDepartmentData = () => {
    const departments = [...new Set(employees.map(e => e.department))];
    
    return departments.map((dept, index) => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptActivities = activities.filter(activity => 
        deptEmployees.some(emp => emp.id === activity.user_id)
      );
      
      const activeEmployees = deptEmployees.filter(emp => 
        deptActivities.some(activity => activity.user_id === emp.id)
      ).length;
      
      const avgActivitiesPerEmployee = deptActivities.length / deptEmployees.length || 0;
      const participationRate = (activeEmployees / deptEmployees.length) * 100;
      
      return {
        department: dept,
        totalEmployees: deptEmployees.length,
        activeEmployees,
        totalActivities: deptActivities.length,
        avgPerEmployee: avgActivitiesPerEmployee,
        participationRate,
        color: COLORS[index % COLORS.length],
      };
    }).sort((a, b) => b.totalActivities - a.totalActivities);
  };

  const departmentData = processDepartmentData();
  const topDepartment = departmentData[0];
  const totalActivities = departmentData.reduce((sum, dept) => sum + dept.totalActivities, 0);

  return (
    <div className="space-y-6">
      {/* Department Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Top Department</p>
                <p className="text-xl font-bold text-slate-800">{topDepartment?.department || 'N/A'}</p>
                <p className="text-sm text-blue-600">{topDepartment?.totalActivities || 0} activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Participation</p>
                <p className="text-xl font-bold text-slate-800">
                  {(departmentData.reduce((sum, dept) => sum + dept.participationRate, 0) / departmentData.length || 0).toFixed(0)}%
                </p>
                <p className="text-sm text-green-600">Across all departments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Departments</p>
                <p className="text-xl font-bold text-slate-800">{departmentData.length}</p>
                <p className="text-sm text-purple-600">All active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Bar Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              Department Performance
            </CardTitle>
            <CardDescription>
              Total activities submitted by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="department" 
                  stroke="#64748b" 
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    value,
                    name === 'totalActivities' ? 'Total Activities' : name
                  ]}
                />
                <Bar 
                  dataKey="totalActivities" 
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Distribution Pie Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Activity Distribution
            </CardTitle>
            <CardDescription>
              Share of total activities by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, totalActivities }) => 
                    `${department}: ${((totalActivities / totalActivities) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalActivities"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Department Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
          <CardDescription>
            Comprehensive breakdown of department performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-semibold text-slate-700">Department</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Employees</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Active</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Activities</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Avg/Employee</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Participation</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept, index) => (
                  <tr key={dept.department} className={index % 2 === 0 ? "bg-slate-50" : ""}>
                    <td className="p-3 font-medium text-slate-800">{dept.department}</td>
                    <td className="p-3 text-right text-slate-600">{dept.totalEmployees}</td>
                    <td className="p-3 text-right text-slate-600">{dept.activeEmployees}</td>
                    <td className="p-3 text-right font-semibold text-blue-600">{dept.totalActivities}</td>
                    <td className="p-3 text-right text-slate-600">{dept.avgPerEmployee.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        dept.participationRate >= 80 ? 'bg-green-100 text-green-700' :
                        dept.participationRate >= 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {dept.participationRate.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
