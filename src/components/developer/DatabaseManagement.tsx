
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Table, Shield, Activity, Search, Play, RefreshCw } from "lucide-react";

export const DatabaseManagement = () => {
  const [queryResult, setQueryResult] = useState<any>(null);
  const [customQuery, setCustomQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const executeQuery = async () => {
    if (!customQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query to execute.",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    try {
      console.log('Executing custom query:', customQuery);
      const { data, error } = await supabase.rpc('execute_sql', { 
        query: customQuery 
      });

      if (error) {
        console.error('Query execution error:', error);
        toast({
          title: "Query Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Query executed successfully:', data);
        setQueryResult(data);
        toast({
          title: "Query Executed",
          description: "Query executed successfully.",
        });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      toast({
        title: "Error",
        description: "Failed to execute query.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const checkTableHealth = async () => {
    try {
      console.log('Checking database health...');
      // Check table sizes and row counts
      const { data: tableInfo, error } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public');

      if (error) {
        console.error('Health check error:', error);
        toast({
          title: "Health Check Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Database health check completed:', tableInfo);
        toast({
          title: "Health Check Complete",
          description: "Database health check completed successfully.",
        });
      }
    } catch (error) {
      console.error('Error during health check:', error);
      toast({
        title: "Error",
        description: "Failed to perform health check.",
        variant: "destructive",
      });
    }
  };

  const databaseTables = [
    {
      name: "profiles",
      description: "User profile information and roles",
      rowCount: "~50",
      status: "healthy"
    },
    {
      name: "activities",
      description: "Employee daily activity logs",
      rowCount: "~200",
      status: "healthy"
    },
    {
      name: "messages",
      description: "Internal messaging system data",
      rowCount: "~75",
      status: "healthy"
    },
    {
      name: "reports",
      description: "Generated system reports",
      rowCount: "~25",
      status: "healthy"
    }
  ];

  const rlsPolicies = [
    {
      table: "profiles",
      policy: "Users can view all profiles",
      type: "SELECT",
      status: "active"
    },
    {
      table: "activities",
      policy: "Users can manage their own activities",
      type: "ALL",
      status: "active"
    },
    {
      table: "messages",
      policy: "Users can view their own messages",
      type: "SELECT",
      status: "active"
    },
    {
      table: "reports",
      policy: "All users can view reports",
      type: "SELECT",
      status: "active"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Database Management
          </h2>
          <p className="text-gray-600">Monitor and manage database schema, policies, and health</p>
        </div>
        <Button onClick={checkTableHealth} variant="outline" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Health Check
        </Button>
      </div>

      <Tabs defaultValue="schema" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="policies">RLS Policies</TabsTrigger>
          <TabsTrigger value="query">Query Interface</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-5 h-5" />
                Database Schema Overview
              </CardTitle>
              <CardDescription>
                View all tables and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databaseTables.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{table.name}</h4>
                        <Badge variant={table.status === "healthy" ? "default" : "destructive"}>
                          {table.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{table.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{table.rowCount} rows</p>
                      <p className="text-xs text-gray-500">Estimated</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Row Level Security Policies
              </CardTitle>
              <CardDescription>
                Monitor and manage RLS policies across all tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rlsPolicies.map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{policy.policy}</h4>
                        <Badge variant="outline">{policy.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Table: {policy.table}</p>
                    </div>
                    <Badge variant={policy.status === "active" ? "default" : "secondary"}>
                      {policy.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                SQL Query Interface
              </CardTitle>
              <CardDescription>
                Execute custom SQL queries for debugging and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="query">SQL Query</Label>
                <Textarea
                  id="query"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="SELECT * FROM profiles LIMIT 10;"
                  rows={6}
                  className="font-mono"
                />
              </div>
              
              <Button 
                onClick={executeQuery} 
                disabled={isExecuting}
                className="flex items-center gap-2"
              >
                {isExecuting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Execute Query
              </Button>

              {queryResult && (
                <div className="mt-4">
                  <Label>Query Result</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Database Health Monitor
              </CardTitle>
              <CardDescription>
                Monitor database performance and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-green-700">Connection Status</h4>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                  <p className="text-sm text-gray-600">Database is responding normally</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-blue-700">Active Connections</h4>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-gray-600">Current active connections</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-700">Total Tables</h4>
                  <p className="text-2xl font-bold text-purple-600">4</p>
                  <p className="text-sm text-gray-600">Public schema tables</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-orange-700">RLS Policies</h4>
                  <p className="text-2xl font-bold text-orange-600">8</p>
                  <p className="text-sm text-gray-600">Active security policies</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-red-700">Last Migration</h4>
                  <p className="text-2xl font-bold text-red-600">2h ago</p>
                  <p className="text-sm text-gray-600">Messages RLS update</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-indigo-700">Storage Used</h4>
                  <p className="text-2xl font-bold text-indigo-600">2.3MB</p>
                  <p className="text-sm text-gray-600">Total database size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
