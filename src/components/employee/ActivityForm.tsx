
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Clock } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
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
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          Log Daily Activity
        </CardTitle>
        <CardDescription>
          Record your work activities for today. Be specific about tasks completed and time spent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
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
                  className="mt-1 min-h-[120px]"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeStarted" className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Start Time
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
                    End Time
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
                  className="mt-1 min-h-[120px]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || hasSubmittedToday}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              {isSubmitting ? "Submitting..." : hasSubmittedToday ? "Already Submitted" : "Submit Activity"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
