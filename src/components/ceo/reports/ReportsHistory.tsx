
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportCard } from "./ReportCard";
import type { Report } from "@/hooks/useReports";

interface ReportsHistoryProps {
  reports: Report[];
  isDeveloper: boolean;
  onDownload: (report: Report) => Promise<void>;
  onDelete: (reportId: string) => Promise<void>;
}

export const ReportsHistory = ({ reports, isDeveloper, onDownload, onDelete }: ReportsHistoryProps) => {
  return (
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
              <ReportCard
                key={report.id}
                report={report}
                isDeveloper={isDeveloper}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
