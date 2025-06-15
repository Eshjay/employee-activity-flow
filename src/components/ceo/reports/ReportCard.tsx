
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Mail, Trash2 } from "lucide-react";
import type { Report } from "@/hooks/useReports";

interface ReportCardProps {
  report: Report;
  isDeveloper: boolean;
  onDownload: (report: Report) => Promise<void>;
  onDelete: (reportId: string) => Promise<void>;
}

export const ReportCard = ({ report, isDeveloper, onDownload, onDelete }: ReportCardProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 gap-3">
      <div className="flex items-center gap-4 mb-2 sm:mb-0">
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
      
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
            onClick={() => onDownload(report)}
          >
            <Download className="w-3 h-3" />
            Download
          </Button>
          {isDeveloper && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
              onClick={() => onDelete(report.id)}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
