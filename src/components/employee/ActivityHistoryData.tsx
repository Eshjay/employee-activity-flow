
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, FileText, Plus } from "lucide-react";
import { useActivities, type Activity } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";

export const ActivityHistoryData = () => {
  const { profile } = useAuth();
  const { fetchUserActivities } = useActivities();
  const [userActivities, setUserActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserActivities = async () => {
      if (profile?.id) {
        const activities = await fetchUserActivities(profile.id);
        // Sort by date (newest first) and then by creation time
        const sortedActivities = activities.sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare === 0) {
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          }
          return dateCompare;
        });
        setUserActivities(sortedActivities);
      }
      setLoading(false);
    };

    loadUserActivities();
  }, [profile?.id, fetchUserActivities]);

  // Group activities by date
  const groupedActivities = userActivities.reduce((groups, activity) => {
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
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading activity history...</div>
      </div>
    );
  }

  if (userActivities.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Activities Yet</h3>
        <p className="text-gray-500">Start logging your daily activities to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Activity History
        </h2>
        <Badge variant="outline" className="text-sm">
          {userActivities.length} activities logged
        </Badge>
      </div>

      {Object.entries(groupedActivities).map(([date, activities]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-700">{formatDate(date)}</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </Badge>
          </div>
          
          {activities.map((activity, index) => (
            <Card key={activity.id} className="border-0 shadow-md hover:shadow-lg transition-shadow ml-8">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {activity.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Plus className="w-3 h-3 mr-1" />
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-slate-600 mb-4 text-base leading-relaxed">
                  {activity.description}
                </CardDescription>
                
                <div className="flex items-center gap-6 text-sm text-slate-500 mb-3 flex-wrap">
                  {activity.time_started && activity.time_ended && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(activity.time_started)} - {formatTime(activity.time_ended)}
                      </span>
                    </div>
                  )}
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    submitted
                  </Badge>
                  {activity.created_at && (
                    <span className="text-xs text-slate-400">
                      Logged at {new Date(activity.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  )}
                </div>
                
                {activity.comments && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600">
                      <strong>Notes:</strong> {activity.comments}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};
