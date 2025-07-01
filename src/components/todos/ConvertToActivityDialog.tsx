
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTodos, Todo } from "@/hooks/useTodos";

interface ConvertToActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo;
}

export const ConvertToActivityDialog = ({ isOpen, onClose, todo }: ConvertToActivityDialogProps) => {
  const { convertTodoToActivity } = useTodos();
  const [formData, setFormData] = useState({
    time_started: '',
    time_ended: '',
    additional_comments: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await convertTodoToActivity(
        todo.id,
        formData.time_started || undefined,
        formData.time_ended || undefined,
        formData.additional_comments || undefined
      );
      
      setFormData({
        time_started: '',
        time_ended: '',
        additional_comments: ''
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Convert Todo to Activity</DialogTitle>
          <DialogDescription>
            Convert "{todo.title}" to a logged activity with optional time tracking
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time_started">Time Started (Optional)</Label>
              <Input
                id="time_started"
                type="time"
                value={formData.time_started}
                onChange={(e) => setFormData(prev => ({ ...prev, time_started: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_ended">Time Ended (Optional)</Label>
              <Input
                id="time_ended"
                type="time"
                value={formData.time_ended}
                onChange={(e) => setFormData(prev => ({ ...prev, time_ended: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_comments">Additional Comments (Optional)</Label>
            <Textarea
              id="additional_comments"
              value={formData.additional_comments}
              onChange={(e) => setFormData(prev => ({ ...prev, additional_comments: e.target.value }))}
              placeholder="Add any additional notes about this activity"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This will create a new activity log entry and mark the todo as converted. 
              The original todo will remain in your completed list for reference.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Converting...' : 'Convert to Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
