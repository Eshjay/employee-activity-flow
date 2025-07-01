
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, CheckCircle, PlayCircle, XCircle } from "lucide-react";
import { useTasks, Task } from "@/hooks/useTasks";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  canEdit: boolean;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

export const TaskCard = ({ task, canEdit, getStatusColor, getPriorityColor }: TaskCardProps) => {
  const { updateTask } = useTasks();

  const handleStatusChange = async (newStatus: Task['status']) => {
    const updates: Partial<Task> = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    await updateTask(task.id, updates);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <PlayCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {task.title}
          </CardTitle>
          <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User className="w-3 h-3" />
          <span>
            {task.assignee_name || 'Unknown'} 
            {task.assigner_name && ` • by ${task.assigner_name}`}
          </span>
        </div>

        {task.due_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Badge className={`${getStatusColor(task.status)} text-xs flex items-center gap-1`}>
            {getStatusIcon(task.status)}
            {task.status.replace('_', ' ')}
          </Badge>
          
          {canEdit && task.status !== 'completed' && task.status !== 'cancelled' && (
            <div className="flex gap-1">
              {task.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('in_progress')}
                  className="text-xs h-6 px-2"
                >
                  Start
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('completed')}
                  className="text-xs h-6 px-2"
                >
                  Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
