
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeDetailModal } from "../../shared/EmployeeDetailModal";
import { MessagingSystemData } from "../../shared/MessagingSystemData";
import { EmployeeCard } from "./EmployeeCard";
import { getEmployeeStatus, getWeeklyActivityCount, getTodayActivityCount, getLastActivityDate } from "./utils";
import type { EmployeeData } from "./types";
import type { Activity } from "@/hooks/useActivities";

interface TeamOverviewContainerProps {
  employees: EmployeeData[];
  activities: Activity[];
  currentUserId?: string;
}

export const TeamOverviewContainer = ({ employees, activities, currentUserId }: TeamOverviewContainerProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [messagingRecipient, setMessagingRecipient] = useState<{id: string, name: string} | null>(null);

  const handleViewEmployee = (employee: EmployeeData) => {
    const employeeActivities = activities.filter(a => a.user_id === employee.id);
    const lastActivityDate = getLastActivityDate(employee.id, activities);
    
    setSelectedEmployee({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      lastActivity: lastActivityDate,
      status: getEmployeeStatus(employee.id, activities),
      activitiesThisWeek: getWeeklyActivityCount(employee.id, activities),
      activities: employeeActivities
    });
    setIsModalOpen(true);
  };

  const handleSendMessage = (employee: EmployeeData) => {
    setMessagingRecipient({ id: employee.id, name: employee.name });
    setIsMessagingOpen(true);
  };

  if (employees.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-semibold text-gray-600 mb-2">No Employees Found</div>
        <p className="text-gray-500">No employees are currently registered in the system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Team Activity Status</CardTitle>
          <CardDescription>
            Current status of daily activity submissions from all team members - Today: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => {
              const status = getEmployeeStatus(employee.id, activities);
              const weeklyCount = getWeeklyActivityCount(employee.id, activities);
              const todayCount = getTodayActivityCount(employee.id, activities);
              
              return (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  stats={{
                    todayCount,
                    weeklyCount,
                    status
                  }}
                  onViewEmployee={handleViewEmployee}
                  onSendMessage={handleSendMessage}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId={currentUserId}
      />

      {messagingRecipient && currentUserId && (
        <MessagingSystemData
          currentUserId={currentUserId}
          recipientId={messagingRecipient.id}
          recipientName={messagingRecipient.name}
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}
    </div>
  );
};
