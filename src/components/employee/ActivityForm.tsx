
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityFormProps {
  onSubmitted: () => void;
  hasSubmittedToday: boolean;
}

export const ActivityForm = ({ onSubmitted, hasSubmittedToday }: ActivityFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeStarted, setTimeStarted] = useState("");
  const [timeEnded, setTimeEnded] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to submit activities.",
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
          title,
          description,
          time_started: timeStarted || null,
          time_ended: timeEnded || null,
          comments: comments || null,
          date: new Date().toISOString().split('T')[0] // Today's date
        });

      if (error) throw error;

      toast({
        title: "Activity Logged Successfully!",
        description: "Your daily activity has been recorded and will be included in today's report.",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setTimeStarted("");
      setTimeEnded("");
      setComments("");
      
      onSubmitted();
    } catch (error: any) {
      console.error('Error submitting activity:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          Log Daily Activity
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Record your work activities for today. Be specific about tasks completed and time spent.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-4 sm:gap-6`}>
            {/* Left Column - Always full width on mobile */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Task Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Client presentation preparation"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you accomplished today..."
                  required
                  className={`mt-1 ${isMobile ? 'min-h-[100px]' : 'min-h-[120px]'}`}
                />
              </div>
            </div>

            {/* Right Column - Time inputs and comments */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="timeStarted" className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className={isMobile ? 'text-xs' : ''}>Start Time</span>
                  </Label>
                  <Input
                    id="timeStarted"
                    type="time"
                    value={timeStarted}
                    onChange={(e) => setTimeStarted(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="timeEnded" className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className={isMobile ? 'text-xs' : ''}>End Time</span>
                  </Label>
                  <Input
                    id="timeEnded"
                    type="time"
                    value={timeEnded}
                    onChange={(e) => setTimeEnded(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="comments" className="text-sm font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any additional comments or observations..."
                  className={`mt-1 ${isMobile ? 'min-h-[100px]' : 'min-h-[120px]'}`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 sm:pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || hasSubmittedToday}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-6 sm:px-8"
              size={isMobile ? "default" : "default"}
            >
              {isSubmitting ? "Submitting..." : hasSubmittedToday ? "Already Submitted" : "Submit Activity"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
