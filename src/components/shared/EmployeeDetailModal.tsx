
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Mail, Building2, TrendingUp, Clock, History, Download } from "lucide-react";
import { MessagingSystemData } from "./MessagingSystemData";
import { useActivities, type Activity } from "@/hooks/useActivities";
import { generateEmployeePDFReport } from "@/utils/reports/pdfReportGenerator";
import { useToast } from "@/hooks/use-toast";

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
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const { fetchUserActivities } = useActivities();
  const { toast } = useToast();

  useEffect(() => {
    const loadEmployeeActivities = async () => {
      if (employee?.id) {
        const activities = await fetchUserActivities(employee.id);
        const sortedActivities = activities
          .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
        
        setAllActivities(sortedActivities);
        setRecentActivities(sortedActivities.slice(0, 3));
      }
    };
    if (isOpen && employee) {
      loadEmployeeActivities();
    } else if (!isOpen) {
      // Reset states when modal is closed
      setShowFullHistory(false);
      setRecentActivities([]);
      setAllActivities([]);
      setExpandedActivities(new Set());
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

  const handleViewFullHistory = () => {
    setShowFullHistory(true);
  };

  const handleBackToDetail = () => {
    setShowFullHistory(false);
  };

  const toggleActivityExpansion = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const handleGenerateFullPDF = async () => {
    try {
      toast({
        title: "Generating PDF Report",
        description: "Creating comprehensive activity report...",
      });

      await generateEmployeePDFReport(employee.name, allActivities, 'full');
      
      toast({
        title: "PDF Report Generated",
        description: `Activity report for ${employee.name} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      if (!employee) return;
      
      toast({
        title: "Generating PDF Report",
        description: "Creating daily activity report...",
      });

      // Get all activities for this employee (not just recent ones)
      const allEmployeeActivities = await fetchUserActivities(employee.id);
      
      // Filter for today's activities
      const todaysActivities = allEmployeeActivities.filter(
        activity => {
          const activityDate = new Date(activity.date).toDateString();
          const today = new Date().toDateString();
          return activityDate === today;
        }
      );

      if (todaysActivities.length === 0) {
        toast({
          title: "No Activities Found",
          description: "No activities found for today. Generating report with available data.",
          variant: "destructive",
        });
        return;
      }

      await generateEmployeePDFReport(employee.name, todaysActivities, 'daily');
      
      toast({
        title: "PDF Report Generated",
        description: `Daily report for ${employee.name} has been downloaded (${todaysActivities.length} activities).`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Group activities by date for history view
  const groupedActivities = allActivities.reduce((groups, activity) => {
    const date = activity.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className={`p-0 overflow-hidden rounded-2xl shadow-strong animate-scale-in dark:bg-gray-900 dark:border-gray-700 ${
          showFullHistory 
            ? 'w-[95vw] max-w-4xl max-h-[85vh]' 
            : 'w-[95vw] max-w-2xl max-h-[80vh]'
        }`}>
          <div className={`flex flex-col h-full ${
            showFullHistory ? 'max-h-[85vh]' : 'max-h-[80vh]'
          }`}>
            {/* Header */}
            <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-100 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shadow-soft">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-lg">
                        {employee.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-responsive-xl font-bold text-slate-800 dark:text-gray-100 mb-1">{employee.name}</h2>
                      <p className="text-responsive-base text-slate-600 dark:text-gray-300">{employee.department}</p>
                    </div>
                  </DialogTitle>
                  <DialogDescription className="text-responsive-sm text-slate-500 dark:text-gray-300 mt-2">
                    {showFullHistory 
                      ? `Complete Activity History • ${allActivities.length} total entries`
                      : 'Employee activity details and performance overview'
                    }
                  </DialogDescription>
                </div>
                {showFullHistory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToDetail}
                    className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ← Back
                  </Button>
                )}
              </div>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
              {!showFullHistory ? (
                /* Detail View */
                <div className="space-y-6">
                  {/* Info Grid - Mobile Optimized */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-600 shadow-subtle">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                        <p className="text-responsive-sm font-medium text-slate-800 dark:text-gray-200 truncate">{employee.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-600 shadow-subtle">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Department</p>
                        <p className="text-responsive-sm font-medium text-slate-800 dark:text-gray-200 truncate">{employee.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-600 shadow-subtle">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Last Activity</p>
                        <p className="text-responsive-sm font-medium text-slate-800 dark:text-gray-200">
                          {employee.lastActivity ? new Date(employee.lastActivity).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-600 shadow-subtle">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">This Week</p>
                        <p className="text-responsive-sm font-medium text-slate-800 dark:text-gray-200">{employee.activitiesThisWeek} activities</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-4 sm:p-5 rounded-xl border border-slate-100 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-responsive-base font-semibold text-slate-800 dark:text-gray-100 mb-1">Current Status</h3>
                        <p className="text-responsive-sm text-slate-600 dark:text-gray-300">Employee submission status for today</p>
                      </div>
                      {getStatusBadge(employee.status)}
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-slate-100 dark:bg-gray-700 rounded-lg">
                        <Clock className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                      </div>
                      <h3 className="text-responsive-lg font-semibold text-slate-800 dark:text-gray-100">Recent Activities</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-600 shadow-subtle hover:shadow-soft transition-all duration-200">
                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-responsive-base font-semibold text-slate-800 dark:text-gray-100 mb-1">{activity.title}</h4>
                                <p className="text-responsive-sm text-slate-600 dark:text-gray-300 mb-2 line-clamp-2">{activity.description}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                                  {new Date(activity.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <Badge variant="outline" className="bg-slate-50 dark:bg-gray-700 dark:text-gray-200 font-medium">
                                  {calculateHours(activity)}h
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 px-4">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-slate-400 dark:text-gray-500" />
                          </div>
                          <p className="text-responsive-base text-slate-500 dark:text-gray-400 font-medium">No recent activities found</p>
                          <p className="text-responsive-sm text-slate-400 dark:text-gray-500 mt-1">Activities will appear here once submitted</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* History View */
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                      {allActivities.length} Activities
                    </Badge>
                    <Button
                      onClick={handleGenerateFullPDF}
                      className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                      disabled={allActivities.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Full PDF
                    </Button>
                  </div>

                  {/* All Activities */}
                  {allActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-responsive-lg font-semibold text-slate-600 dark:text-gray-300 mb-2">
                        No Activities Found
                      </h3>
                      <p className="text-responsive-sm text-slate-500 dark:text-gray-400">
                        This employee hasn't submitted any activities yet.
                      </p>
                    </div>
                  ) : (
                    Object.entries(groupedActivities).map(([date, activities]) => (
                      <div key={date} className="space-y-4">
                        {/* Date Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-responsive-lg font-semibold text-slate-700 dark:text-gray-200">
                            {formatDate(date)}
                          </h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                          </Badge>
                        </div>

                        {/* Activities for this date */}
                        <div className="space-y-3 ml-8">
                          {activities.map((activity) => {
                            const isExpanded = expandedActivities.has(activity.id);
                            const hours = calculateHours(activity);
                            
                            return (
                              <div
                                key={activity.id}
                                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-600 shadow-subtle hover:shadow-soft transition-all duration-200"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-responsive-base font-semibold text-slate-800 dark:text-gray-100">
                                    {activity.title}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
                                      {hours}h
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleActivityExpansion(activity.id)}
                                      className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                      {isExpanded ? '▲' : '▼'}
                                    </Button>
                                  </div>
                                </div>
                                
                                <p className={`text-slate-600 dark:text-gray-300 text-responsive-sm leading-relaxed ${
                                  isExpanded ? 'mb-4' : 'mb-3 line-clamp-2'
                                }`}>
                                  {activity.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400 flex-wrap">
                                  {activity.time_started && activity.time_ended && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {formatTime(activity.time_started)} - {formatTime(activity.time_ended)}
                                      </span>
                                    </div>
                                  )}
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                                    submitted
                                  </Badge>
                                  {activity.created_at && (
                                    <span className="text-xs text-slate-400 dark:text-gray-500">
                                      Logged at {new Date(activity.created_at).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  )}
                                </div>

                                {isExpanded && activity.comments && (
                                  <div className="mt-4 bg-slate-50 dark:bg-gray-700 p-3 rounded-lg border border-slate-200 dark:border-gray-600">
                                    <p className="text-responsive-sm text-slate-600 dark:text-gray-300">
                                      <strong>Notes:</strong> {activity.comments}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions - Only show in detail view */}
            {!showFullHistory && (
              <div className="flex-shrink-0 p-4 sm:p-6 border-t border-slate-100 dark:border-gray-700 bg-slate-25 dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 touch-target btn-hover-lift text-responsive-sm font-medium"
                    onClick={handleViewFullHistory}
                  >
                    <History className="w-4 h-4 mr-2" />
                    View Full History
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 touch-target btn-hover-lift text-responsive-sm font-medium"
                    onClick={handleGeneratePDF}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Messaging System */}
      {currentUserId && !showFullHistory && (
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
