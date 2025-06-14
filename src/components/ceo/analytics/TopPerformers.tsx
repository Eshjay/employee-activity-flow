
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ExtendedEmployeeData } from "./types";
import { TrendIndicator } from "./TrendIndicator";

interface TopPerformersProps {
  topPerformers: ExtendedEmployeeData[];
  timeRange: "week" | "month" | "quarter";
  onSelectEmployee: (employee: ExtendedEmployeeData) => void;
}

export const TopPerformers = ({ topPerformers, timeRange, onSelectEmployee }: TopPerformersProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          Top Performers
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Employees with the highest activity submissions this {timeRange}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-3 gap-4'}`}>
          {topPerformers.map((employee, index) => (
            <div key={employee.id} className="relative">
              {index === 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                  1
                </div>
              )}
              <Card className="border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelectEmployee(employee)}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex-shrink-0`}>
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                        {employee.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{employee.name}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 truncate">{employee.department}</p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {employee.totalActivities} {isMobile ? '' : 'activities'}
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
