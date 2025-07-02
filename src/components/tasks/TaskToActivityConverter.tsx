
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Clock } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useActivities } from '@/hooks/useActivities';
import { useToast } from '@/hooks/use-toast';

interface TaskToActivityConverterProps {
  task: Task;
  onConvert?: () => void;
}

export const TaskToActivityConverter = ({ task, onConvert }: TaskToActivityConverterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeStarted, setTimeStarted] = useState('');
  const [timeEnded, setTimeEnded] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  
  const { updateTask } = useTasks();
  const { createActivity } = useActivities();
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!timeStarted || !timeEnded) {
      toast({
        title: "Time Required",
        description: "Please provide both start and end times",
        variant: "destructive",
      });
      return;
    }

    if (timeStarted >= timeEnded) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      // Calculate duration in minutes
      const start = new Date(`1970-01-01T${timeStarted}`);
      const end = new Date(`1970-01-01T${timeEnded}`);
      const durationMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));

      // Create activity from task
      await createActivity({
        title: task.title,
        description: task.description || '',
        time_started: timeStarted,
        time_ended: timeEnded,
        comments: additionalComments || `Converted from task: ${task.title}`,
        date: new Date().toISOString().split('T')[0],
        duration_minutes: durationMinutes,
        is_time_tracked: true,
      });

      // Update task status to completed
      await updateTask(task.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      toast({
        title: "Task Converted",
        description: "Task has been successfully converted to an activity",
      });

      setIsOpen(false);
      onConvert?.();
      
      // Reset form
      setTimeStarted('');
      setTimeEnded('');
      setAdditionalComments('');

    } catch (error) {
      console.error('Error converting task to activity:', error);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert task to activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <ArrowRight className="w-3 h-3" />
          Convert to Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Convert Task to Activity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {task.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeStarted">Start Time</Label>
              <Input
                id="timeStarted"
                type="time"
                value={timeStarted}
                onChange={(e) => setTimeStarted(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="timeEnded">End Time</Label>
              <Input
                id="timeEnded"
                type="time"
                value={timeEnded}
                onChange={(e) => setTimeEnded(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Additional Comments (Optional)</Label>
            <Textarea
              id="comments"
              placeholder="Add any additional notes about this activity..."
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleConvert}
              disabled={isConverting || !timeStarted || !timeEnded}
              className="flex-1"
            >
              {isConverting ? "Converting..." : "Convert to Activity"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isConverting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
