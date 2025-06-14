
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, FileText } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";

export const ActivityHistoryData = () => {
  const { profile } = useAuth();
  const { fetchUserActivities } = useActivities();
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserActivities = async () => {
      if (profile?.id) {
        const activities = await fetchUserActivities(profile.id);
        setUserActivities(activities);
      }
      setLoading(false);
    };

    loadUserActivities();
  }, [profile?.id, fetchUserActivities]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Activity History
        </h2>
        <Badge variant="outline" className="text-sm">
          {userActivities.length} activities logged
        </Badge>
      </div>

      {userActivities.map((activity) => (
        <Card key={activity.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">
                {activity.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(activity.date).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-slate-600 mb-4 text-base leading-relaxed">
              {activity.description}
            </CardDescription>
            
            <div className="flex items-center gap-6 text-sm text-slate-500 mb-3">
              {activity.time_started && activity.time_ended && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{activity.time_started} - {activity.time_ended}</span>
                </div>
              )}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                submitted
              </Badge>
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
  );
};
