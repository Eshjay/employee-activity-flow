
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Mail, FileText, TrendingUp, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateDailyReport, generateWeeklyReport } from "@/utils/downloadUtils";
import { sendDailyReminders, sendWeeklyReport } from "@/utils/emailUtils";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";

export const ActivityReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const { profile } = useAuth();
  const { reports, loading, addReport, deleteReport } = useReports();
  const { toast } = useToast();

  const handleGenerateReport = async (type: string) => {
    setIsGenerating(true);
    toast({
      title: "Generating Report",
      description: `Creating ${type.toLowerCase()}...`,
    });
    
    try {
      // Generate the actual file
      if (type === "Daily Report") {
        generateDailyReport();
      } else if (type === "Weekly Summary") {
        generateWeeklyReport();
      }

      // Add report to database
      await addReport({
        type,
        date: new Date().toISOString().split('T')[0], // Today's date
        employees_submitted: Math.floor(Math.random() * 12) + 1, // Random for demo
        total_employees: 12,
        status: 'completed',
        email_sent: false
      });

      toast({
        title: "Report Generated",
        description: `${type} has been generated and downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (report: any) => {
    if (report.type === "Daily Report") {
      generateDailyReport();
    } else if (report.type === "Weekly Summary") {
      generateWeeklyReport();
    }

    toast({
      title: "Download Started",
      description: `Downloading ${report.type} from ${new Date(report.date).toLocaleDateString()}`,
    });
  };

  const handleDeleteReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Only allow developers to delete reports
    if (profile?.role !== 'developer') {
      toast({
        title: "Access Denied",
        description: "Only developers can delete reports.",
        variant: "destructive",
      });
      return;
    }

    const success = await deleteReport(reportId);
    if (success) {
      toast({
        title: "Report Deleted",
        description: `${report.type} from ${new Date(report.date).toLocaleDateString()} has been deleted.`,
      });
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

  const isDeveloper = profile?.role === 'developer';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Generate Reports
          </CardTitle>
          <CardDescription>
            Create and download activity reports for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-12 flex items-center gap-2" 
              variant="outline"
              onClick={() => handleGenerateReport("Daily Report")}
              disabled={isGenerating}
            >
              <FileText className="w-4 h-4" />
              Daily Report
            </Button>
            <Button 
              className="h-12 flex items-center gap-2" 
              variant="outline"
              onClick={() => handleGenerateReport("Weekly Summary")}
              disabled={isGenerating}
            >
              <Calendar className="w-4 h-4" />
              Weekly Summary
            </Button>
            <Button 
              className="h-12 flex items-center gap-2" 
              variant="outline"
              onClick={handleSendReminders}
              disabled={isSendingEmails}
            >
              <Mail className="w-4 h-4" />
              {isSendingEmails ? "Sending..." : "Send Reminders"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Reports History</CardTitle>
          <CardDescription>
            Previously generated reports and email notifications
            {isDeveloper && (
              <span className="ml-2 text-blue-600 font-medium">
                (Developer: Delete access enabled)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports generated yet. Create your first report above.
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{report.type}</h3>
                      <p className="text-sm text-slate-600">
                        {new Date(report.date).toLocaleDateString()} • 
                        {report.employees_submitted}/{report.total_employees} employees submitted
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {report.email_sent && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email Sent
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {report.status}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                      
                      {isDeveloper && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
