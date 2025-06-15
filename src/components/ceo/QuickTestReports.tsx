
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateDailyReport, generateWeeklyReport } from "@/utils/downloadUtils";
import { TestTube, CheckCircle, XCircle, Download } from "lucide-react";

export const QuickTestReports = () => {
  const [testing, setTesting] = useState<{ daily: boolean; weekly: boolean }>({
    daily: false,
    weekly: false
  });
  const [results, setResults] = useState<{ daily?: boolean; weekly?: boolean }>({});
  const { toast } = useToast();

  const testDailyReport = async () => {
    setTesting(prev => ({ ...prev, daily: true }));
    try {
      await generateDailyReport();
      setResults(prev => ({ ...prev, daily: true }));
      toast({
        title: "Daily Report Test Passed",
        description: "Daily report generated successfully in CSV format",
      });
    } catch (error) {
      setResults(prev => ({ ...prev, daily: false }));
      toast({
        title: "Daily Report Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, daily: false }));
    }
  };

  const testWeeklyReport = async () => {
    setTesting(prev => ({ ...prev, weekly: true }));
    try {
      await generateWeeklyReport();
      setResults(prev => ({ ...prev, weekly: true }));
      toast({
        title: "Weekly Report Test Passed",
        description: "Weekly report generated successfully in CSV format (FIXED)",
      });
    } catch (error) {
      setResults(prev => ({ ...prev, weekly: false }));
      toast({
        title: "Weekly Report Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, weekly: false }));
    }
  };

  const getResultIcon = (result?: boolean) => {
    if (result === undefined) return null;
    return result ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getResultBadge = (result?: boolean) => {
    if (result === undefined) return null;
    return (
      <Badge variant={result ? "default" : "destructive"}>
        {result ? "Passed" : "Failed"}
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-blue-600" />
          Quick Report Testing
        </CardTitle>
        <p className="text-sm text-gray-600">
          Test report generation functionality including the CSV format fix
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Daily Report (CSV)</span>
              {getResultIcon(results.daily)}
            </div>
            <Button 
              onClick={testDailyReport}
              disabled={testing.daily}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              {testing.daily ? "Testing..." : "Test Daily Report"}
            </Button>
            {getResultBadge(results.daily)}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Weekly Report (CSV - Fixed)</span>
              {getResultIcon(results.weekly)}
            </div>
            <Button 
              onClick={testWeeklyReport}
              disabled={testing.weekly}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              {testing.weekly ? "Testing..." : "Test Weekly Report"}
            </Button>
            {getResultBadge(results.weekly)}
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Weekly report format has been fixed to generate CSV instead of JSON. 
            Both reports now provide consistent CSV format for better data analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
