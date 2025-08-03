import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, Download, X, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useActivities, type Activity } from "@/hooks/useActivities";
import { generateEmployeePDFReport } from "@/utils/reports/pdfReportGenerator";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface FullHistoryModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onBackToDetail?: () => void;
}

export const FullHistoryModal = ({ employee, isOpen, onClose, onBackToDetail }: FullHistoryModalProps) => {
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const { fetchUserActivities } = useActivities();
  const { toast } = useToast();

  useEffect(() => {
    const loadAllActivities = async () => {
      if (employee?.id && isOpen) {
        setLoading(true);
        setExpandedActivities(new Set()); // Reset expanded state
        try {
          const activities = await fetchUserActivities(employee.id);
          const sortedActivities = activities.sort(
            (a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
          );
          setAllActivities(sortedActivities);
        } catch (error) {
          console.error('Error loading activities:', error);
          toast({
            title: "Error Loading Activities",
            description: "Failed to load employee activities. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else if (!isOpen) {
        // Clean up when modal closes
        setAllActivities([]);
        setExpandedActivities(new Set());
        setLoading(false);
      }
    };

    loadAllActivities();
  }, [employee?.id, isOpen, fetchUserActivities, toast]);

  if (!employee) return null;

  // Group activities by date
  const groupedActivities = allActivities.reduce((groups, activity) => {
    const date = activity.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

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

  const calculateHours = (activity: Activity) => {
    if (activity.time_started && activity.time_ended) {
      try {
        const start = new Date(`2000-01-01T${activity.time_started}`);
        const end = new Date(`2000-01-01T${activity.time_ended}`);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return Math.max(0, Math.round(diffHours * 2) / 2);
      } catch {
        return 8;
      }
    }
    return 8;
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

  const handleGeneratePDF = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] p-0 overflow-hidden rounded-2xl shadow-strong animate-scale-in dark:bg-gray-900 dark:border-gray-700 z-60">
        <div className="flex flex-col h-full max-h-[85vh]">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-100 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-responsive-xl font-bold text-slate-800 dark:text-gray-100 mb-1">
                  Complete Activity History
                </DialogTitle>
                <DialogDescription className="text-responsive-sm text-slate-600 dark:text-gray-300">
                  All activities for {employee.name} • {allActivities.length} total entries
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {onBackToDetail && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        onBackToDetail();
                      }, 150);
                    }}
                    className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Action Bar */}
          <div className="flex-shrink-0 p-4 border-b border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                <FileText className="w-3 h-3 mr-1" />
                {allActivities.length} Activities
              </Badge>
              <Button
                onClick={handleGeneratePDF}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                disabled={allActivities.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-800">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-responsive-base text-slate-500 dark:text-gray-400">
                  Loading activity history...
                </div>
              </div>
            ) : allActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400 dark:text-gray-500" />
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
                    {activities.map((activity, index) => {
                      const isExpanded = expandedActivities.has(activity.id);
                      const hours = calculateHours(activity);
                      
                      return (
                        <Card
                          key={activity.id}
                          className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-900 dark:border-gray-700"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-responsive-base font-semibold text-slate-800 dark:text-gray-100">
                                {activity.title}
                              </CardTitle>
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
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription 
                              className={`text-slate-600 dark:text-gray-300 text-responsive-sm leading-relaxed ${
                                isExpanded ? 'mb-4' : 'mb-3 line-clamp-2'
                              }`}
                            >
                              {activity.description}
                            </CardDescription>

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
                              <div className="mt-4 bg-slate-50 dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-600">
                                <p className="text-responsive-sm text-slate-600 dark:text-gray-300">
                                  <strong>Notes:</strong> {activity.comments}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
