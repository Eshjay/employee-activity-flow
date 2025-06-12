
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, FileText } from "lucide-react";

const mockActivities = [
  {
    id: 1,
    date: "2024-06-11",
    title: "Client Meeting Preparation",
    description: "Prepared presentation slides and gathered project metrics for upcoming client review meeting.",
    timeStarted: "09:00",
    timeEnded: "11:30",
    comments: "Focused on Q2 performance highlights",
    status: "submitted"
  },
  {
    id: 2,
    date: "2024-06-10",
    title: "Code Review and Testing",
    description: "Reviewed team member's pull requests and conducted unit testing for new features.",
    timeStarted: "14:00",
    timeEnded: "17:00",
    comments: "Found and fixed 3 minor bugs",
    status: "submitted"
  },
  {
    id: 3,
    date: "2024-06-09",
    title: "Database Optimization",
    description: "Optimized database queries and improved application performance by 25%.",
    timeStarted: "10:00",
    timeEnded: "15:30",
    comments: "Significant improvement in load times",
    status: "submitted"
  }
];

export const ActivityHistory = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Activity History
        </h2>
        <Badge variant="outline" className="text-sm">
          {mockActivities.length} activities logged
        </Badge>
      </div>

      {mockActivities.map((activity) => (
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
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{activity.timeStarted} - {activity.timeEnded}</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {activity.status}
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
