
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeDetailModal } from "../../shared/EmployeeDetailModal";
import { MessagingSystemData } from "../../shared/MessagingSystemData";
import { CreateTaskDialog } from "../../tasks/CreateTaskDialog";
import { useProfiles } from "@/hooks/useProfiles";
import { calculateEmployeeStats } from "./utils";
import type { EmployeeData } from "./types";

interface TeamOverviewContainerProps {
  employees: EmployeeData[];
  activities: any[];
  currentUserId?: string;
}

export const TeamOverviewContainer = ({ 
  employees, 
  activities, 
  currentUserId 
}: TeamOverviewContainerProps) => {
  const { profiles } = useProfiles();
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [messageRecipient, setMessageRecipient] = useState<EmployeeData | null>(null);
  const [taskAssignee, setTaskAssignee] = useState<EmployeeData | null>(null);

  // Calculate overall stats
  const today = new Date().toISOString().split('T')[0];
  const todaySubmissions = activities.filter(activity => activity.date === today);
  const submittedEmployeeIds = new Set(todaySubmissions.map(a => a.user_id));
  
  const activeEmployees = employees.filter(emp => submittedEmployeeIds.has(emp.id));
  const pendingEmployees = employees.filter(emp => !submittedEmployeeIds.has(emp.id));

  const stats = [
    {
      title: "Total Employees",
      value: employees.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Submitted Today",
      value: activeEmployees.length,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending Today",
      value: pendingEmployees.length,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Weekly Total",
      value: activities.length,
      icon: AlertTriangle,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const handleViewEmployee = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
  };

  const handleSendMessage = (employee: EmployeeData) => {
    setMessageRecipient(employee);
  };

  const handleAddTask = (employee: EmployeeData) => {
    setTaskAssignee(employee);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-medium">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Overview */}
      <Card className="border-0 shadow-medium">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Team Overview
            </CardTitle>
            <Badge variant="outline" className="font-medium">
              {employees.length} Members
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">No employees found</p>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {employees.map((employee) => {
                const stats = calculateEmployeeStats(employee.id, activities);
                return ( <div className="w-full overflow-hidden">
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    stats={stats}
                    onViewEmployee={handleViewEmployee}
                    onSendMessage={handleSendMessage}
                    onAddTask={handleAddTask}
                  />
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={{
            ...selectedEmployee,
            status: 'active',
            lastActivity: new Date().toISOString(),
            activitiesThisWeek: calculateEmployeeStats(selectedEmployee.id, activities).weeklyCount
          }}
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          currentUserId={currentUserId}
        />
      )}

      {/* Message System */}
      {messageRecipient && currentUserId && (
        <MessagingSystemData
          currentUserId={currentUserId}
          recipientId={messageRecipient.id}
          recipientName={messageRecipient.name}
          isOpen={!!messageRecipient}
          onClose={() => setMessageRecipient(null)}
        />
      )}

      {/* Create Task Dialog */}
      {taskAssignee && (
        <CreateTaskDialog
          isOpen={!!taskAssignee}
          onClose={() => setTaskAssignee(null)}
          profiles={profiles}
          preselectedEmployee={{
            ...taskAssignee,
            role: taskAssignee.role as "employee" | "ceo" | "developer",
            status: 'active',
            last_login: null,
            created_at: new Date().toISOString()
          }}
        />
      )}
    </div>
  );
};
