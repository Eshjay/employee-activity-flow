
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, Plus } from "lucide-react";

export const ActivityForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityData, setActivityData] = useState({
    title: "",
    description: "",
    timeStarted: "",
    timeEnded: "",
    comments: ""
  });
  
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit activities.",
        variant: "destructive",
      });
      return;
    }

    if (!activityData.title || !activityData.description) {
      toast({
        title: "Error",
        description: "Please fill in the title and description fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: profile.id,
          title: activityData.title.trim(),
          description: activityData.description.trim(),
          time_started: activityData.timeStarted || null,
          time_ended: activityData.timeEnded || null,
          comments: activityData.comments.trim() || null,
          date: new Date().toISOString().split('T')[0] // Today's date
        });

      if (error) throw error;

      toast({
        title: "Activity Submitted Successfully!",
        description: "Your daily activity has been recorded.",
      });

      // Reset form for next submission
      setActivityData({
        title: "",
        description: "",
        timeStarted: "",
        timeEnded: "",
        comments: ""
      });

    } catch (error: any) {
      console.error('Error submitting activity:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setActivityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Add New Activity
        </CardTitle>
        <CardDescription>
          Submit multiple activities throughout your day. Each submission will be recorded separately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title *</Label>
            <Input
              id="title"
              value={activityData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief title for your activity (e.g., 'Client Meeting', 'Code Review')"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={activityData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of what you accomplished..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeStarted">Start Time </Label>
              <Input
                id="timeStarted"
                type="time"
                value={activityData.timeStarted}
                onChange={(e) => handleInputChange('timeStarted', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeEnded">End Time </Label>
              <Input
                id="timeEnded"
                type="time"
                value={activityData.timeEnded}
                onChange={(e) => handleInputChange('timeEnded', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Additional Notes (Optional)</Label>
            <Textarea
              id="comments"
              value={activityData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              placeholder="Any additional notes, challenges faced, or achievements..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Activity
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
