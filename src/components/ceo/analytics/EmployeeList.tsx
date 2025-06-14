
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ExtendedEmployeeData } from "./types";
import { TrendIndicator } from "./TrendIndicator";

interface EmployeeListProps {
  employeeData: ExtendedEmployeeData[];
  selectedEmployee: ExtendedEmployeeData | null;
  onSelectEmployee: (employee: ExtendedEmployeeData) => void;
}

export const EmployeeList = ({ employeeData, selectedEmployee, onSelectEmployee }: EmployeeListProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          All Employees
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Click on any employee to view detailed progress
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className={`space-y-2 sm:space-y-3 ${isMobile ? 'max-h-80' : 'max-h-96'} overflow-y-auto`}>
          {employeeData.map((employee) => (
            <div
              key={employee.id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedEmployee?.id === employee.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => onSelectEmployee(employee)}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} flex-shrink-0`}>
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold">
                    {employee.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{employee.name}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  {employee.totalActivities}
                </Badge>
                <TrendIndicator 
                  trend={employee.trend}
                  percentage={employee.trendPercentage}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
