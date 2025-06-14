
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { ExtendedEmployeeData } from "./types";
import { getTrendIcon, getTrendColor } from "./utils";

interface EmployeeListProps {
  employeeData: ExtendedEmployeeData[];
  selectedEmployee: ExtendedEmployeeData | null;
  onSelectEmployee: (employee: ExtendedEmployeeData) => void;
}

export const EmployeeList = ({ employeeData, selectedEmployee, onSelectEmployee }: EmployeeListProps) => {
  return (
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
              onClick={() => onSelectEmployee(employee)}
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
  );
};
