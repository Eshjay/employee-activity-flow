
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Mail, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockReports = [
  {
    id: 1,
    type: "Daily Report",
    date: "2024-06-12",
    employeesSubmitted: 9,
    totalEmployees: 12,
    status: "completed",
    emailSent: true
  },
  {
    id: 2,
    type: "Weekly Summary",
    date: "2024-06-10",
    employeesSubmitted: 12,
    totalEmployees: 12,
    status: "completed",
    emailSent: true
  },
  {
    id: 3,
    type: "Daily Report",
    date: "2024-06-11",
    employeesSubmitted: 11,
    totalEmployees: 12,
    status: "completed",
    emailSent: true
  }
];

export const ActivityReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async (type: string) => {
    setIsGenerating(true);
    toast({
      title: "Generating Report",
      description: `Creating ${type.toLowerCase()}...`,
    });
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Report Generated",
        description: `${type} has been generated successfully.`,
      });
    }, 2000);
  };

  const handleDownloadReport = (reportId: number) => {
    const report = mockReports.find(r => r.id === reportId);
    toast({
      title: "Download Started",
      description: `Downloading ${report?.type} from ${report?.date}`,
    });
    // In a real app, this would trigger actual file download
  };

  const handleSendReminders = () => {
    toast({
      title: "Reminders Sent",
      description: "Email reminders have been sent to employees with pending submissions.",
    });
  };

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
            >
              <Mail className="w-4 h-4" />
              Send Reminders
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{report.type}</h3>
                    <p className="text-sm text-slate-600">
                      {new Date(report.date).toLocaleDateString()} • 
                      {report.employeesSubmitted}/{report.totalEmployees} employees submitted
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {report.emailSent && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email Sent
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {report.status}
                  </Badge>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleDownloadReport(report.id)}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
