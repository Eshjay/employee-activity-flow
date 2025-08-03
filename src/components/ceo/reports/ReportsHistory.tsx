
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ReportCard } from "./ReportCard";
import type { Report } from "@/hooks/useReports";

interface ReportsHistoryProps {
  reports: Report[];
  isDeveloper: boolean;
  onDownload: (report: Report) => Promise<void>;
  onDelete: (reportId: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 5;

export const ReportsHistory = ({ reports, isDeveloper, onDownload, onDelete }: ReportsHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter and search logic
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           new Date(report.date).toLocaleDateString().includes(searchTerm);
      const matchesType = filterType === "all" || report.type === filterType;
      const matchesStatus = filterStatus === "all" || report.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchTerm, filterType, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  // Get unique report types and statuses for filters
  const reportTypes = [...new Set(reports.map(r => r.type))];
  const reportStatuses = [...new Set(reports.map(r => r.status))];

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Show limited view initially
  const displayReports = isExpanded ? currentReports : currentReports.slice(0, 3);
  const hasMoreToShow = !isExpanded && filteredReports.length > 3;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Reports History
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {filteredReports.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Previously generated reports and email notifications
              {isDeveloper && (
                <span className="ml-2 text-blue-600 font-medium">
                  (Developer: Delete access enabled)
                </span>
              )}
            </CardDescription>
          </div>
          
          {reports.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {isExpanded ? 'Show Less' : 'Show Filters'}
            </Button>
          )}
        </div>

        {/* Filters - Only show when expanded or when there are many reports */}
        {isExpanded && reports.length > 0 && (
          <div className="mt-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by report type or date..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterType} onValueChange={(value) => { setFilterType(value); handleFilterChange(); }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {reportTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); handleFilterChange(); }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {reportStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(searchTerm || filterType !== "all" || filterStatus !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterStatus("all");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-4">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">No reports generated yet</p>
              <p className="text-sm">Create your first report above to get started.</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">No reports match your filters</p>
              <p className="text-sm">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <>
              {displayReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isDeveloper={isDeveloper}
                  onDownload={onDownload}
                  onDelete={onDelete}
                />
              ))}
              
              {/* Show More Button */}
              {hasMoreToShow && (
                <div className="text-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Show All {filteredReports.length} Reports
                  </Button>
                </div>
              )}
              
              {/* Pagination */}
              {isExpanded && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
