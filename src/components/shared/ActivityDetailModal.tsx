
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, User, FileText, MessageSquare } from 'lucide-react';
import { Activity } from '@/hooks/useActivities';
import { format } from 'date-fns';

interface ActivityDetailModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDetailModal = ({ activity, isOpen, onClose }: ActivityDetailModalProps) => {
  if (!activity) return null;

  const formatTime = (time: string | null) => {
    if (!time) return 'Not set';
    return format(new Date(`1970-01-01T${time}`), 'h:mm a');
  };

  const calculateDuration = () => {
    if (!activity.time_started || !activity.time_ended) return null;
    
    const start = new Date(`1970-01-01T${activity.time_started}`);
    const end = new Date(`1970-01-01T${activity.time_ended}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins} minutes`;
    
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Activity Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{activity.title}</h3>
                  <Badge variant="outline">
                    {format(new Date(activity.date), 'MMM dd, yyyy')}
                  </Badge>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300">{activity.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Time Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Start Time:</span>
                  <p className="font-medium">{formatTime(activity.time_started)}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">End Time:</span>
                  <p className="font-medium">{formatTime(activity.time_ended)}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <p className="font-medium">
                    {activity.duration_minutes 
                      ? `${activity.duration_minutes} minutes` 
                      : calculateDuration() || 'Not calculated'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Time Tracked:</span>
                  <p className="font-medium">
                    {activity.is_time_tracked ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {activity.comments && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comments
                </h4>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {activity.comments}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Additional Information
              </h4>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Activity ID:</span>
                  <span className="font-mono text-xs">{activity.id}</span>
                </div>
                {activity.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span>{format(new Date(activity.created_at), 'MMM dd, yyyy h:mm a')}</span>
                  </div>
                )}
                {activity.todo_source_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Source:</span>
                    <span>Converted from Todo</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
