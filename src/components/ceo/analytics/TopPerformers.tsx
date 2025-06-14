
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import type { ExtendedEmployeeData } from "./types";
import { TrendIndicator } from "./TrendIndicator";

interface TopPerformersProps {
  topPerformers: ExtendedEmployeeData[];
  timeRange: "week" | "month" | "quarter";
  onSelectEmployee: (employee: ExtendedEmployeeData) => void;
}

export const TopPerformers = ({ topPerformers, timeRange, onSelectEmployee }: TopPerformersProps) => {
  return (
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
                    onClick={() => onSelectEmployee(employee)}>
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
                        <TrendIndicator 
                          trend={employee.trend}
                          percentage={employee.trendPercentage}
                        />
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
  );
};
