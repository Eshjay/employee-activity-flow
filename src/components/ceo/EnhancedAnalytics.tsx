
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Calendar, Building2, Sparkles } from "lucide-react";
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
      bgColor: "bg-blue-50",
      change: "+12% from last period",
      trend: "up"
    },
    { 
      title: "Active Employees", 
      value: `${activeEmployees}/${employees.length}`, 
      icon: Users, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: `${Math.round((activeEmployees/employees.length) * 100)}% participation`,
      trend: "neutral"
    },
    { 
      title: "Avg. per Employee", 
      value: avgSubmissionsPerEmployee.toFixed(1), 
      icon: TrendingUp, 
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+8% improvement",
      trend: "up"
    },
    { 
      title: "Departments", 
      value: departments.length.toString(), 
      icon: Building2, 
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      change: "All departments active",
      trend: "neutral"
    },
  ];

  const tabs = [
    { value: "patterns", label: isMobile ? "Patterns" : "Submission Patterns", icon: Calendar },
    { value: "departments", label: isMobile ? "Depts" : "Department Analysis", icon: Building2 },
    { value: "individual", label: isMobile ? "Individual" : "Individual Progress", icon: Users },
    { value: "completion", label: isMobile ? "Rates" : "Completion Rates", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-soft">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-responsive-2xl font-bold text-slate-800 text-balance">Enhanced Analytics</h2>
            <p className="text-responsive-base text-slate-600 text-pretty">Deep insights into employee productivity and engagement patterns</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(["week", "month", "quarter"] as const).map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
              className="capitalize btn-hover-lift font-medium shadow-soft"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="card-elevated hover:shadow-strong transition-all duration-300 border-0" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 sm:p-3 rounded-xl ${stat.bgColor} shadow-subtle`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                </div>
                <Badge variant="outline" className={`text-2xs sm:text-xs font-medium ${
                  stat.trend === 'up' ? 'bg-green-50 text-green-700 border-green-200' : 
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {isMobile ? stat.change.split(' ')[0] : stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-2xs sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  {stat.title}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 leading-none">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Analytics Tabs */}
      <Card className="card-elevated border-0 shadow-strong">
        <CardHeader className="pb-4">
          <CardTitle className="text-responsive-lg font-bold text-slate-800">Detailed Analytics</CardTitle>
          <CardDescription className="text-responsive-sm text-slate-600">
            Comprehensive analysis across different dimensions and time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patterns" className="space-y-6">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 h-auto' : 'grid-cols-4 h-12'} bg-slate-50 p-1 rounded-xl`}>
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className={`flex items-center gap-1 sm:gap-2 font-medium transition-all duration-200
                             ${isMobile ? 'flex-col py-3 px-2 text-xs' : 'text-sm'} 
                             data-[state=active]:bg-white data-[state=active]:shadow-soft`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="patterns" className="space-y-6 animate-fade-in">
              <SubmissionPatternChart 
                activities={activities} 
                timeRange={selectedTimeRange} 
              />
            </TabsContent>

            <TabsContent value="departments" className="space-y-6 animate-fade-in">
              <DepartmentProductivityChart 
                employees={employees} 
                activities={activities} 
                timeRange={selectedTimeRange} 
              />
            </TabsContent>

            <TabsContent value="individual" className="space-y-6 animate-fade-in">
              <IndividualProgressChart 
                employees={employees} 
                activities={activities} 
                timeRange={selectedTimeRange} 
              />
            </TabsContent>

            <TabsContent value="completion" className="space-y-6 animate-fade-in">
              <CompletionRatesChart 
                employees={employees} 
                activities={activities} 
                timeRange={selectedTimeRange} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
