
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Calendar, Building2 } from "lucide-react";
import { SubmissionPatternChart } from "./analytics/SubmissionPatternChart";
import { DepartmentProductivityChart } from "./analytics/DepartmentProductivityChart";
import { IndividualProgressChart } from "./analytics/IndividualProgressChart";
import { CompletionRatesChart } from "./analytics/CompletionRatesChart";
import { useProfiles } from "@/hooks/useProfiles";
import { useActivities } from "@/hooks/useActivities";

export const EnhancedAnalytics = () => {
  const { profiles } = useProfiles();
  const { activities } = useActivities();
  const [selectedTimeRange, setSelectedTimeRange] = useState<"week" | "month" | "quarter">("month");

  const employees = profiles.filter(p => p.role === 'employee');
  const departments = [...new Set(employees.map(e => e.department))];
  
  // Calculate key metrics
  const totalSubmissions = activities.length;
  const activeEmployees = employees.filter(emp => 
    activities.some(activity => activity.user_id === emp.id)
  ).length;
  const avgSubmissionsPerEmployee = totalSubmissions / employees.length || 0;

  const stats = [
    { 
      title: "Total Submissions", 
      value: totalSubmissions.toString(), 
      icon: BarChart3, 
      color: "text-blue-600",
      change: "+12% from last period"
    },
    { 
      title: "Active Employees", 
      value: `${activeEmployees}/${employees.length}`, 
      icon: Users, 
      color: "text-green-600",
      change: `${Math.round((activeEmployees/employees.length) * 100)}% participation`
    },
    { 
      title: "Avg. per Employee", 
      value: avgSubmissionsPerEmployee.toFixed(1), 
      icon: TrendingUp, 
      color: "text-purple-600",
      change: "+8% improvement"
    },
    { 
      title: "Departments", 
      value: departments.length.toString(), 
      icon: Building2, 
      color: "text-amber-600",
      change: "All departments active"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Enhanced Analytics</h2>
          <p className="text-slate-600 mt-1">Deep insights into employee productivity and engagement</p>
        </div>
        <div className="flex gap-2">
          {(["week", "month", "quarter"] as const).map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-full bg-slate-100 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-600">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="patterns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Submission Patterns
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Department Analysis
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Individual Progress
          </TabsTrigger>
          <TabsTrigger value="completion" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Completion Rates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          <SubmissionPatternChart 
            activities={activities} 
            timeRange={selectedTimeRange} 
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <DepartmentProductivityChart 
            employees={employees} 
            activities={activities} 
            timeRange={selectedTimeRange} 
          />
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <IndividualProgressChart 
            employees={employees} 
            activities={activities} 
            timeRange={selectedTimeRange} 
          />
        </TabsContent>

        <TabsContent value="completion" className="space-y-6">
          <CompletionRatesChart 
            employees={employees} 
            activities={activities} 
            timeRange={selectedTimeRange} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
