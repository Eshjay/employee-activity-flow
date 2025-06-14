
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, Clock, AlertCircle, Eye, Mail } from "lucide-react";
import type { EmployeeData, EmployeeStats } from "./types";

interface EmployeeCardProps {
  employee: EmployeeData;
  stats: EmployeeStats;
  onViewEmployee: (employee: EmployeeData) => void;
  onSendMessage: (employee: EmployeeData) => void;
}

export const EmployeeCard = ({ employee, stats, onViewEmployee, onSendMessage }: EmployeeCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "missing":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Submitted</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
      case "missing":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Missing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
            {employee.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-slate-800">{employee.name}</h3>
          <p className="text-sm text-slate-600">{employee.department} • {employee.email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">{stats.todayCount}</p>
          <p className="text-xs text-slate-500">Today</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">{stats.weeklyCount}</p>
          <p className="text-xs text-slate-500">This week</p>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(stats.status)}
          {getStatusBadge(stats.status)}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onViewEmployee(employee)}
          >
            <Eye className="w-3 h-3" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onSendMessage(employee)}
          >
            <Mail className="w-3 h-3" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
};
