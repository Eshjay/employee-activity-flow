
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, Clock, AlertCircle, Eye, Mail } from "lucide-react";
import { EmployeeDetailModal } from "../shared/EmployeeDetailModal";
import { MessagingSystemData } from "../shared/MessagingSystemData";
import { useProfiles } from "@/hooks/useProfiles";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";

export const TeamOverviewData = () => {
  const { profiles, loading: profilesLoading } = useProfiles();
  const { activities, loading: activitiesLoading } = useActivities();
  const { profile: currentUser } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [messagingRecipient, setMessagingRecipient] = useState<{id: string, name: string} | null>(null);

  const employees = profiles.filter(p => p.role === 'employee');
  const today = new Date().toISOString().split('T')[0];

  const getEmployeeStatus = (employeeId: string) => {
    const todayActivities = activities.filter(activity => 
      activity.user_id === employeeId && activity.date === today
    );
    
    if (todayActivities.length > 0) return "submitted";
    
    // Check if it's still early in the day (before 5 PM)
    const now = new Date();
    if (now.getHours() < 17) return "pending";
    
    return "missing";
  };

  const getWeeklyActivityCount = (employeeId: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return activities.filter(activity => 
      activity.user_id === employeeId && 
      new Date(activity.date) >= oneWeekAgo
    ).length;
  };

  const getTodayActivityCount = (employeeId: string) => {
    return activities.filter(activity => 
      activity.user_id === employeeId && activity.date === today
    ).length;
  };

  const getLastActivityDate = (employeeId: string) => {
    const userActivities = activities
      .filter(activity => activity.user_id === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return userActivities.length > 0 ? userActivities[0].date : 'No activities';
  };

  const handleViewEmployee = (employee: any) => {
    const employeeActivities = activities.filter(a => a.user_id === employee.id);
    const lastActivityDate = getLastActivityDate(employee.id);
    
    setSelectedEmployee({
      id: parseInt(employee.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number for modal
      name: employee.name,
      email: employee.email,
      department: employee.department,
      lastActivity: lastActivityDate,
      status: getEmployeeStatus(employee.id),
      activitiesThisWeek: getWeeklyActivityCount(employee.id),
      activities: employeeActivities
    });
    setIsModalOpen(true);
  };

  const handleSendMessage = (employee: any) => {
    setMessagingRecipient({ id: employee.id, name: employee.name });
    setIsMessagingOpen(true);
  };

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

  if (profilesLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading team data...</div>
      </div>
    );
  }

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
              const status = getEmployeeStatus(employee.id);
              const weeklyCount = getWeeklyActivityCount(employee.id);
              const todayCount = getTodayActivityCount(employee.id);
              
              return (
                <div key={employee.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
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
                      <p className="text-sm font-medium text-slate-700">{todayCount}</p>
                      <p className="text-xs text-slate-500">Today</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-700">{weeklyCount}</p>
                      <p className="text-xs text-slate-500">This week</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      {getStatusBadge(status)}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleViewEmployee(employee)}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleSendMessage(employee)}
                      >
                        <Mail className="w-3 h-3" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId={currentUser?.id}
      />

      {messagingRecipient && currentUser && (
        <MessagingSystemData
          currentUserId={currentUser.id}
          recipientId={messagingRecipient.id}
          recipientName={messagingRecipient.name}
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}
    </div>
  );
};
