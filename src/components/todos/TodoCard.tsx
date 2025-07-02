
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, CheckCircle, Play, ArrowRight } from "lucide-react";
import { useTodos, Todo } from "@/hooks/useTodos";
import { ConvertToActivityDialog } from "./ConvertToActivityDialog";
import { format } from "date-fns";

interface TodoCardProps {
  todo: Todo;
  onConvertToActivity?: (todo: Todo) => void;
}

export const TodoCard = ({ todo, onConvertToActivity }: TodoCardProps) => {
  const { updateTodo } = useTodos();
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  const handleToggleComplete = async () => {
    await updateTodo(todo.id, { 
      is_completed: !todo.is_completed,
      completed_at: !todo.is_completed ? new Date().toISOString() : undefined
    });
  };

  const handleConvertToActivity = () => {
    if (onConvertToActivity) {
      onConvertToActivity(todo);
    } else {
      setIsConvertDialogOpen(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${todo.is_completed ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={todo.is_completed}
                onCheckedChange={handleToggleComplete}
                className="mt-1"
              />
              <CardTitle className={`text-sm font-medium line-clamp-2 ${todo.is_completed ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </CardTitle>
            </div>
            <Badge className={`${getPriorityColor(todo.priority)} text-xs`}>
              {todo.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {todo.description && (
            <p className={`text-sm line-clamp-2 ${todo.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {todo.description}
            </p>
          )}
          
          {todo.task && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <Play className="w-3 h-3" />
              <span>From task: {todo.task.title}</span>
            </div>
          )}

          {todo.due_date && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Due: {format(new Date(todo.due_date), 'MMM dd, yyyy')}</span>
            </div>
          )}

          {todo.converted_to_activity_id && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <CheckCircle className="w-3 h-3" />
              <span>Converted to activity</span>
            </div>
          )}

          {todo.is_completed && todo.completed_at && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Completed: {format(new Date(todo.completed_at), 'MMM dd, yyyy')}</span>
            </div>
          )}

          {todo.is_completed && !todo.converted_to_activity_id && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleConvertToActivity}
              className="w-full text-xs"
            >
              <ArrowRight className="w-3 h-3 mr-1" />
              Convert to Activity
            </Button>
          )}
        </CardContent>
      </Card>

      <ConvertToActivityDialog
        isOpen={isConvertDialogOpen}
        onClose={() => setIsConvertDialogOpen(false)}
        todo={todo}
      />
    </>
  );
};
