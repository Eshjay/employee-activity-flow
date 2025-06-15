
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Mail, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateDailyReport, generateWeeklyReport } from "@/utils/downloadUtils";
import { sendDailyReminders } from "@/utils/emailUtils";

interface ReportGeneratorProps {
  onReportGenerated: (type: string) => Promise<void>;
}

export const ReportGenerator = ({ onReportGenerated }: ReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async (type: string) => {
    setIsGenerating(true);
    toast({
      title: "Generating Report",
      description: `Creating ${type.toLowerCase()} with current data...`,
    });
    
    try {
      console.log(`Generating ${type} with real data`);
      
      // Generate the actual file with real data
      if (type === "Daily Report") {
        await generateDailyReport();
      } else if (type === "Weekly Summary") {
        await generateWeeklyReport();
      }

      // Add report to database
      await onReportGenerated(type);

      toast({
        title: "Report Generated",
        description: `${type} has been generated with current data and downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendReminders = async () => {
    setIsSendingEmails(true);
    toast({
      title: "Sending Reminders",
      description: "Sending email reminders to employees...",
    });

    try {
      const success = await sendDailyReminders();
      if (success) {
        toast({
          title: "Reminders Sent",
          description: "Email reminders have been sent to employees with pending submissions.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Generate Reports
        </CardTitle>
        <CardDescription>
          Create and download activity reports with current employee data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button 
            className="h-12 flex items-center gap-2" 
            variant="outline"
            onClick={() => handleGenerateReport("Daily Report")}
            disabled={isGenerating}
            size="sm"
          >
            <FileText className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Daily Report"}
          </Button>
          <Button 
            className="h-12 flex items-center gap-2" 
            variant="outline"
            onClick={() => handleGenerateReport("Weekly Summary")}
            disabled={isGenerating}
            size="sm"
          >
            <Calendar className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Weekly Summary"}
          </Button>
          <Button 
            className="h-12 flex items-center gap-2" 
            variant="outline"
            onClick={handleSendReminders}
            disabled={isSendingEmails}
            size="sm"
          >
            <Mail className="w-4 h-4" />
            {isSendingEmails ? "Sending..." : "Send Reminders"}
          </Button>
        </div>
        
        {isGenerating && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Reports now use real employee data from the database instead of mock data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
