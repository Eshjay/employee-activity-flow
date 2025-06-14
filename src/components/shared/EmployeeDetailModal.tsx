
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Mail, Building2, TrendingUp, Clock } from "lucide-react";
import { MessagingSystemData } from "./MessagingSystemData";
import { useActivities, type Activity } from "@/hooks/useActivities";

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  lastActivity: string;
  status: string;
  activitiesThisWeek: number;
}

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const EmployeeDetailModal = ({ employee, isOpen, onClose, currentUserId }: EmployeeDetailModalProps) => {
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const { fetchUserActivities } = useActivities();

  useEffect(() => {
    const loadEmployeeActivities = async () => {
      if (employee?.id) {
        const activities = await fetchUserActivities(employee.id.toString());
        // Get the 3 most recent activities
        const sortedActivities = activities
          .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
          .slice(0, 3);
        setRecentActivities(sortedActivities);
      }
    };

    if (isOpen && employee) {
      loadEmployeeActivities();
    }
  }, [employee, isOpen, fetchUserActivities]);

  if (!employee) return null;

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

  const calculateHours = (activity: Activity) => {
    if (activity.time_started && activity.time_ended) {
      const start = new Date(`2000-01-01T${activity.time_started}`);
      const end = new Date(`2000-01-01T${activity.time_ended}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, Math.round(diffHours * 2) / 2); // Round to nearest 0.5
    }
    return 8; // Default 8 hours if no time specified
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {employee.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{employee.name}</h2>
                <p className="text-sm text-slate-600">{employee.department}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Employee activity details and performance overview
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Last activity: {new Date(employee.lastActivity).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span>{employee.activitiesThisWeek} activities this week</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="font-medium">Current Status:</span>
              {getStatusBadge(employee.status)}
            </div>

            {/* Recent Activities */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Activities
              </h3>
              <div className="space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-slate-600 truncate max-w-xs">{activity.description}</p>
                        <p className="text-xs text-slate-600">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline">{calculateHours(activity)}h</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 p-3 bg-slate-50 rounded-lg">No recent activities found</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                View Full History
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsMessagingOpen(true)}
              >
                Send Message
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messaging System */}
      {currentUserId && (
        <MessagingSystemData
          currentUserId={currentUserId}
          recipientId={employee.id.toString()}
          recipientName={employee.name}
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}
    </>
  );
};
