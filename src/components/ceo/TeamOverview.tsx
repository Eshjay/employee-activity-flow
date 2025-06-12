
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";

const mockEmployees = [
  {
    id: 1,
    name: "John Smith",
    email: "john@company.com",
    department: "Development",
    lastActivity: "2024-06-12",
    status: "submitted",
    activitiesThisWeek: 5
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah@company.com",
    department: "Marketing",
    lastActivity: "2024-06-12",
    status: "submitted",
    activitiesThisWeek: 4
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@company.com",
    department: "Sales",
    lastActivity: "2024-06-11",
    status: "pending",
    activitiesThisWeek: 3
  },
  {
    id: 4,
    name: "Emma Davis",
    email: "emma@company.com",
    department: "Design",
    lastActivity: "2024-06-12",
    status: "submitted",
    activitiesThisWeek: 5
  },
  {
    id: 5,
    name: "David Brown",
    email: "david@company.com",
    department: "Development",
    lastActivity: "2024-06-10",
    status: "missing",
    activitiesThisWeek: 2
  }
];

export const TeamOverview = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "missing":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Submitted</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
      case "missing":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Missing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Team Activity Status</CardTitle>
          <CardDescription>
            Current status of daily activity submissions from all team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {employee.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-800">{employee.name}</h3>
                    <p className="text-sm text-slate-600">{employee.department} • {employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">{employee.activitiesThisWeek}</p>
                    <p className="text-xs text-slate-500">This week</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(employee.status)}
                    {getStatusBadge(employee.status)}
                  </div>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    View
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
