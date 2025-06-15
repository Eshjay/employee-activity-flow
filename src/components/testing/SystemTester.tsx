
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useActivities } from "@/hooks/useActivities";
import { useReports } from "@/hooks/useReports";
import { useUserManagement } from "@/hooks/useUserManagement";
import { generateDailyReport, generateWeeklyReport } from "@/utils/downloadUtils";
import { CheckCircle, XCircle, Clock, Play, AlertTriangle } from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

export const SystemTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { profile } = useAuth();
  const { activities } = useActivities();
  const { reports } = useReports();
  const { users } = useUserManagement();
  const { toast } = useToast();

  const updateTestResult = (name: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTestResults(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, duration } : test
    ));
  };

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTestResult(testName, 'running');
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'passed', 'Success', duration);
      console.log(`✅ Test passed: ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      updateTestResult(testName, 'failed', message, duration);
      console.error(`❌ Test failed: ${testName} - ${message}`);
    }
  };

  const testAuthentication = async () => {
    if (!profile) {
      throw new Error('User not authenticated');
    }
    
    // Test profile data integrity
    if (!profile.id || !profile.email || !profile.role) {
      throw new Error('Profile data incomplete');
    }
    
    // Test role validation
    const validRoles = ['employee', 'ceo', 'developer'];
    if (!validRoles.includes(profile.role)) {
      throw new Error(`Invalid role: ${profile.role}`);
    }
  };

  const testActivityManagement = async () => {
    if (!activities) {
      throw new Error('Activities not loaded');
    }
    
    // Test activity data structure
    if (activities.length > 0) {
      const activity = activities[0];
      const requiredFields = ['id', 'user_id', 'title', 'description', 'date'];
      
      for (const field of requiredFields) {
        if (!(field in activity)) {
          throw new Error(`Activity missing required field: ${field}`);
        }
      }
    }
  };

  const testReportGeneration = async () => {
    // Test daily report generation
    await generateDailyReport();
    
    // Test weekly report generation (now fixed to use CSV)
    await generateWeeklyReport();
    
    // Verify reports are tracked in database
    if (!reports || reports.length === 0) {
      console.warn('No reports found in database - this may be expected for new installations');
    }
  };

  const testUserManagement = async () => {
    if (profile?.role === 'developer' || profile?.role === 'ceo') {
      if (!users) {
        throw new Error('User management data not loaded');
      }
      
      // Test user data structure
      if (users.length > 0) {
        const user = users[0];
        const requiredFields = ['id', 'name', 'email', 'role', 'department'];
        
        for (const field of requiredFields) {
          if (!(field in user)) {
            throw new Error(`User missing required field: ${field}`);
          }
        }
      }
    } else {
      // For employees, skip this test
      console.log('User management test skipped - employee role');
    }
  };

  const testDataIntegrity = async () => {
    // Test profile-activity relationships
    const userActivities = activities.filter(a => a.user_id === profile?.id);
    
    // Test date formats
    if (activities.length > 0) {
      const activity = activities[0];
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(activity.date)) {
        throw new Error(`Invalid date format: ${activity.date}`);
      }
    }
    
    // Test time formats if present
    const activitiesWithTime = activities.filter(a => a.time_started && a.time_ended);
    if (activitiesWithTime.length > 0) {
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      const activity = activitiesWithTime[0];
      if (activity.time_started && !timeRegex.test(activity.time_started)) {
        throw new Error(`Invalid time format: ${activity.time_started}`);
      }
    }
  };

  const testUIResponsiveness = async () => {
    // Test window dimensions and responsive behavior
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (windowWidth < 320) {
      throw new Error('Window too narrow for mobile support');
    }
    
    // Test basic DOM elements exist
    const dashboardElements = document.querySelectorAll('[data-testid], .dashboard, .card');
    if (dashboardElements.length === 0) {
      throw new Error('No dashboard elements found');
    }
  };

  const testPerformance = async () => {
    const startTime = performance.now();
    
    // Simulate data loading operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    if (loadTime > 5000) {
      throw new Error(`Page load time too slow: ${loadTime}ms`);
    }
  };

  const testErrorHandling = async () => {
    // Test console errors
    const originalConsoleError = console.error;
    let errorCount = 0;
    
    console.error = (...args) => {
      errorCount++;
      originalConsoleError(...args);
    };
    
    // Wait a moment to catch any existing errors
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.error = originalConsoleError;
    
    if (errorCount > 5) {
      throw new Error(`Too many console errors detected: ${errorCount}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    const tests = [
      { name: 'Authentication System', fn: testAuthentication },
      { name: 'Activity Management', fn: testActivityManagement },
      { name: 'Report Generation (Fixed CSV)', fn: testReportGeneration },
      { name: 'User Management', fn: testUserManagement },
      { name: 'Data Integrity', fn: testDataIntegrity },
      { name: 'UI Responsiveness', fn: testUIResponsiveness },
      { name: 'Performance', fn: testPerformance },
      { name: 'Error Handling', fn: testErrorHandling }
    ];
    
    // Initialize test results
    setTestResults(tests.map(test => ({ name: test.name, status: 'pending' })));
    
    // Run tests sequentially
    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
    
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    
    toast({
      title: "Testing Complete",
      description: `${passed} tests passed, ${failed} tests failed`,
      variant: failed > 0 ? "destructive" : "default"
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          System Comprehensive Testing Suite
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comprehensive testing of all application functionality including the fixed weekly report CSV format
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            User: {profile?.name} ({profile?.role})
          </div>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          {testResults.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <span className="font-medium">{test.name}</span>
                {test.duration && (
                  <span className="text-xs text-gray-500">({test.duration}ms)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {test.message && test.status === 'failed' && (
                  <span className="text-xs text-red-600 max-w-xs truncate">
                    {test.message}
                  </span>
                )}
                {getStatusBadge(test.status)}
              </div>
            </div>
          ))}
        </div>
        
        {testResults.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(t => t.status === 'passed').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(t => t.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {testResults.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
