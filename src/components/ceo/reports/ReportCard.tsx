
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Mail, Trash2, Calendar, Users } from "lucide-react";
import type { Report } from "@/hooks/useReports";

interface ReportCardProps {
  report: Report;
  isDeveloper: boolean;
  onDownload: (report: Report) => Promise<void>;
  onDelete: (reportId: string) => Promise<void>;
}

export const ReportCard = ({ report, isDeveloper, onDownload, onDelete }: ReportCardProps) => {
  const submissionRate = Math.round((report.employees_submitted / Math.max(report.total_employees, 1)) * 100);
  const isHighSubmission = submissionRate >= 80;
  const isMediumSubmission = submissionRate >= 50;

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left side - Report info */}
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 dark:text-gray-100 mb-1 truncate">{report.type}</h3>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{report.employees_submitted}/{report.total_employees} submitted</span>
                  <Badge 
                    variant="outline" 
                    className={`ml-1 text-xs ${
                      isHighSubmission 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300' 
                        : isMediumSubmission 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300'
                    }`}
                  >
                    {submissionRate}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Status and actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2">
              {report.email_sent && (
                <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email Sent
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
              >
                {report.status}
              </Badge>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => onDownload(report)}
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              
              {isDeveloper && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  onClick={() => onDelete(report.id)}
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
