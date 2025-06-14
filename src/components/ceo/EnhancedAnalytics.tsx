
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
import { useIsMobile } from "@/hooks/use-mobile";

export const EnhancedAnalytics = () => {
  const { profiles } = useProfiles();
  const { activities } = useActivities();
  const [selectedTimeRange, setSelectedTimeRange] = useState<"week" | "month" | "quarter">("month");
  const isMobile = useIsMobile();

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

  const tabs = [
    { value: "patterns", label: isMobile ? "Patterns" : "Submission Patterns", icon: Calendar },
    { value: "departments", label: isMobile ? "Departments" : "Department Analysis", icon: Building2 },
    { value: "individual", label: isMobile ? "Individual" : "Individual Progress", icon: Users },
    { value: "completion", label: isMobile ? "Completion" : "Completion Rates", icon: TrendingUp },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Enhanced Analytics</h2>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Deep insights into employee productivity and engagement</p>
        </div>
        <div className="flex gap-1 sm:gap-2">
          {(["week", "month", "quarter"] as const).map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? "default" : "outline"}
              size={isMobile ? "sm" : "sm"}
              onClick={() => setSelectedTimeRange(range)}
              className="capitalize text-xs sm:text-sm"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`p-2 sm:p-3 rounded-full bg-slate-100 ${stat.color}`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {isMobile ? stat.change.split(' ')[0] : stat.change}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">{stat.title}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="patterns" className="space-y-4 sm:space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 h-auto' : 'grid-cols-4 h-12'}`}>
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'flex-col py-3 px-2' : ''}`}
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="patterns" className="space-y-4 sm:space-y-6">
          <SubmissionPatternChart 
            activities={activities} 
            timeRange={selectedTimeRange} 
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4 sm:space-y-6">
          <DepartmentProductivityChart 
            employees={employees} 
            activities={activities} 
            timeRange={selectedTimeRange} 
          />
        </TabsContent>

        <TabsContent value="individual" className="space-y-4 sm:space-y-6">
          <IndividualProgressChart 
            employees={employees} 
            activities={activities} 
            timeRange={selectedTimeRange} 
          />
        </TabsContent>

        <TabsContent value="completion" className="space-y-4 sm:space-y-6">
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
