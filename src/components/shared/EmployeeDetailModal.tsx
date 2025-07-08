
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Mail, Building2, TrendingUp, Clock } from "lucide-react";
import { MessagingSystemData } from "./MessagingSystemData";
import { useActivities, type Activity } from "@/hooks/useActivities";

interface Employee {
  id: string;
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
        const activities = await fetchUserActivities(employee.id);
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
        return <Badge className="bg-green-50 text-green-700 border-green-200 font-medium">Submitted</Badge>;
      case "pending":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Pending</Badge>;
      case "missing":
        return <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">Missing</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">Unknown</Badge>;
    }
  };

  const calculateHours = (activity: Activity) => {
    if (activity.time_started && activity.time_ended) {
      const start = new Date(`2000-01-01T${activity.time_started}`);
      const end = new Date(`2000-01-01T${activity.time_ended}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, Math.round(diffHours * 2) / 2);
    }
    return 8;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] p-0 overflow-hidden rounded-2xl shadow-strong animate-scale-in">
          <div className="flex flex-col h-full max-h-[80vh]">
            {/* Header */}
            <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
              <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shadow-soft">
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-lg">
                    {employee.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-responsive-xl font-bold text-slate-800 mb-1">{employee.name}</h2>
                  <p className="text-responsive-base text-slate-600">{employee.department}</p>
                </div>
              </DialogTitle>
              <DialogDescription className="text-responsive-sm text-slate-500 mt-2">
                Employee activity details and performance overview
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
              {/* Info Grid - Mobile Optimized */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-subtle">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                    <p className="text-responsive-sm font-medium text-slate-800 truncate">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-subtle">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Department</p>
                    <p className="text-responsive-sm font-medium text-slate-800 truncate">{employee.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-subtle">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Activity</p>
                    <p className="text-responsive-sm font-medium text-slate-800">
                      {employee.lastActivity ? new Date(employee.lastActivity).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-subtle">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">This Week</p>
                    <p className="text-responsive-sm font-medium text-slate-800">{employee.activitiesThisWeek} activities</p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 sm:p-5 rounded-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-responsive-base font-semibold text-slate-800 mb-1">Current Status</h3>
                    <p className="text-responsive-sm text-slate-600">Employee submission status for today</p>
                  </div>
                  {getStatusBadge(employee.status)}
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-responsive-lg font-semibold text-slate-800">Recent Activities</h3>
                </div>
                
                <div className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle hover:shadow-soft transition-all duration-200">
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-responsive-base font-semibold text-slate-800 mb-1">{activity.title}</h4>
                            <p className="text-responsive-sm text-slate-600 mb-2 line-clamp-2">{activity.description}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {new Date(activity.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="bg-slate-50 font-medium">
                              {calculateHours(activity)}h
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-responsive-base text-slate-500 font-medium">No recent activities found</p>
                      <p className="text-responsive-sm text-slate-400 mt-1">Activities will appear here once submitted</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t border-slate-100 bg-slate-25">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 touch-target btn-hover-lift text-responsive-sm font-medium"
                >
                  View Full History
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 touch-target btn-hover-lift text-responsive-sm font-medium"
                  onClick={() => setIsMessagingOpen(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  className="flex-1 touch-target btn-hover-glow text-responsive-sm font-medium" 
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messaging System */}
      {currentUserId && (
        <MessagingSystemData
          currentUserId={currentUserId}
          recipientId={employee.id}
          recipientName={employee.name}
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}
    </>
  );
};
