
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, Clock, AlertCircle, Eye, Mail, Plus } from "lucide-react";
import type { EmployeeData, EmployeeStats } from "./types";

interface EmployeeCardProps {
  employee: EmployeeData;
  stats: EmployeeStats;
  onViewEmployee: (employee: EmployeeData) => void;
  onSendMessage: (employee: EmployeeData) => void;
  onAddTask: (employee: EmployeeData) => void;
}

export const EmployeeCard = ({ employee, stats, onViewEmployee, onSendMessage, onAddTask }: EmployeeCardProps) => {
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
        return <Badge className="bg-green-50 text-green-700 border-green-200 font-medium">Submitted</Badge>;
      case "pending":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Pending</Badge>;
      case "missing":
        return <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">Missing</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">Unknown</Badge>;
    }
  };

  return (
    <div className="card-elevated p-4 sm:p-6 rounded-xl hover:shadow-medium transition-all duration-300 animate-fade-in">
      {/* Mobile: Vertical Layout */}
      <div className="flex flex-col sm:hidden space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 shadow-soft">
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
              {employee.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base truncate">{employee.name}</h3>
            <p className="text-sm text-slate-600 truncate">{employee.department}</p>
            <p className="text-xs text-slate-500 truncate">{employee.email}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{stats.todayCount}</p>
              <p className="text-xs text-slate-500 font-medium">Today</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{stats.weeklyCount}</p>
              <p className="text-xs text-slate-500 font-medium">This week</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(stats.status)}
            {getStatusBadge(stats.status)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 touch-target btn-hover-lift font-medium"
            onClick={() => onViewEmployee(employee)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 touch-target btn-hover-lift font-medium"
            onClick={() => onSendMessage(employee)}
          >
            <Mail className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 touch-target btn-hover-lift font-medium text-blue-600 hover:text-blue-700"
            onClick={() => onAddTask(employee)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Task
          </Button>
        </div>
      </div>

      {/* Desktop: Horizontal Layout */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shadow-soft">
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
              {employee.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-lg">{employee.name}</h3>
            <p className="text-sm text-slate-600">{employee.department} • {employee.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{stats.todayCount}</p>
            <p className="text-xs text-slate-500 font-medium">Today</p>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{stats.weeklyCount}</p>
            <p className="text-xs text-slate-500 font-medium">This week</p>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(stats.status)}
            {getStatusBadge(stats.status)}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-hover-lift font-medium"
              onClick={() => onViewEmployee(employee)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-hover-lift font-medium"
              onClick={() => onSendMessage(employee)}
            >
              <Mail className="w-4 h-4 mr-1" />
              Message
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-hover-lift font-medium text-blue-600 hover:text-blue-700"
              onClick={() => onAddTask(employee)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
