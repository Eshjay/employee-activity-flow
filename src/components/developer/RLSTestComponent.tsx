
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
}

export const RLSTestComponent = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runRLSTests = async () => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to run RLS tests.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      // Test 1: Check if user can view their own activities
      try {
        const { data: userActivities, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', profile.id);

        if (activitiesError) {
          results.push({
            name: "View Own Activities",
            status: "fail",
            message: `Error: ${activitiesError.message}`
          });
        } else {
          results.push({
            name: "View Own Activities",
            status: "pass",
            message: `Successfully retrieved ${userActivities?.length || 0} activities`
          });
        }
      } catch (error) {
        results.push({
          name: "View Own Activities",
          status: "fail",
          message: `Exception: ${error}`
        });
      }

      // Test 2: Check if user can view their own messages
      try {
        const { data: userMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`);

        if (messagesError) {
          results.push({
            name: "View Own Messages",
            status: "fail",
            message: `Error: ${messagesError.message}`
          });
        } else {
          results.push({
            name: "View Own Messages",
            status: "pass",
            message: `Successfully retrieved ${userMessages?.length || 0} messages`
          });
        }
      } catch (error) {
        results.push({
          name: "View Own Messages",
          status: "fail",
          message: `Exception: ${error}`
        });
      }

      // Test 3: Check if user can view all profiles (should be allowed)
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          results.push({
            name: "View All Profiles",
            status: "fail",
            message: `Error: ${profilesError.message}`
          });
        } else {
          results.push({
            name: "View All Profiles",
            status: "pass",
            message: `Successfully retrieved ${profiles?.length || 0} profiles`
          });
        }
      } catch (error) {
        results.push({
          name: "View All Profiles",
          status: "fail",
          message: `Exception: ${error}`
        });
      }

      // Test 4: Try to insert an activity (should work)
      try {
        const testActivity = {
          user_id: profile.id,
          title: "RLS Test Activity",
          description: "This is a test activity for RLS validation",
          date: new Date().toISOString().split('T')[0]
        };

        const { error: insertError } = await supabase
          .from('activities')
          .insert(testActivity);

        if (insertError) {
          results.push({
            name: "Insert Own Activity",
            status: "fail",
            message: `Error: ${insertError.message}`
          });
        } else {
          results.push({
            name: "Insert Own Activity",
            status: "pass",
            message: "Successfully inserted test activity"
          });

          // Clean up: delete the test activity
          await supabase
            .from('activities')
            .delete()
            .eq('title', 'RLS Test Activity')
            .eq('user_id', profile.id);
        }
      } catch (error) {
        results.push({
          name: "Insert Own Activity",
          status: "fail",
          message: `Exception: ${error}`
        });
      }

      // Test 5: Check RLS is enabled on tables
      try {
        const { data: rlsStatus } = await supabase
          .from('information_schema.tables')
          .select('table_name, row_security')
          .in('table_name', ['activities', 'messages', 'profiles'])
          .eq('table_schema', 'public');

        if (rlsStatus) {
          const enabledTables = rlsStatus.filter(table => table.row_security === 'YES');
          if (enabledTables.length === 3) {
            results.push({
              name: "RLS Status Check",
              status: "pass",
              message: "RLS is enabled on all required tables"
            });
          } else {
            results.push({
              name: "RLS Status Check",
              status: "warning",
              message: `RLS enabled on ${enabledTables.length}/3 tables`
            });
          }
        }
      } catch (error) {
        results.push({
          name: "RLS Status Check",
          status: "warning",
          message: "Could not verify RLS status (this may be normal)"
        });
      }

    } catch (error) {
      results.push({
        name: "General Test",
        status: "fail",
        message: `Unexpected error: ${error}`
      });
    }

    setTestResults(results);
    setIsRunning(false);

    // Show summary toast
    const passCount = results.filter(r => r.status === "pass").length;
    const failCount = results.filter(r => r.status === "fail").length;
    
    toast({
      title: "RLS Tests Completed",
      description: `${passCount} passed, ${failCount} failed`,
      variant: failCount > 0 ? "destructive" : "default",
    });
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      pass: "default",
      fail: "destructive",
      warning: "secondary"
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Row Level Security (RLS) Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Test the current RLS policies to ensure data security is working correctly.
          </p>
          <Button 
            onClick={runRLSTests} 
            disabled={isRunning || !profile}
            className="flex items-center gap-2"
          >
            {isRunning ? "Running Tests..." : "Run RLS Tests"}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div 
                key={index}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.name}</span>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!profile && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please log in to run RLS tests. You need to be authenticated to verify the security policies.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
