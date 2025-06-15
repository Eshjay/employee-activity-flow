
import { useToast } from "@/hooks/use-toast";
import { generateDailyReport, generateWeeklyReport } from "@/utils/downloadUtils";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { ReportGenerator } from "./reports/ReportGenerator";
import { ReportsHistory } from "./reports/ReportsHistory";
import type { Report } from "@/hooks/useReports";

export const ActivityReports = () => {
  const { profile } = useAuth();
  const { reports, loading, addReport, deleteReport } = useReports();
  const { toast } = useToast();

  const handleReportGenerated = async (type: string) => {
    await addReport({
      type,
      date: new Date().toISOString().split('T')[0], // Today's date
      employees_submitted: Math.floor(Math.random() * 12) + 1, // Will be replaced with real data
      total_employees: 12, // Will be replaced with real data
      status: 'completed',
      email_sent: false
    });
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      toast({
        title: "Downloading Report",
        description: `Regenerating ${report.type} with current data...`,
      });

      if (report.type === "Daily Report") {
        await generateDailyReport();
      } else if (report.type === "Weekly Summary") {
        await generateWeeklyReport();
      }

      toast({
        title: "Download Complete",
        description: `${report.type} downloaded with current data.`,
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
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
      <ReportGenerator onReportGenerated={handleReportGenerated} />
      <ReportsHistory 
        reports={reports}
        isDeveloper={isDeveloper}
        onDownload={handleDownloadReport}
        onDelete={handleDeleteReport}
      />
    </div>
  );
};
