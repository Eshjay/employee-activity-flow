
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { User, TrendingUp } from "lucide-react";
import type { Activity } from "@/hooks/useActivities";
import type { ExtendedEmployeeData } from "./types";
import { processEmployeeProgress } from "./utils";

interface ProgressChartProps {
  selectedEmployee: ExtendedEmployeeData | null;
  activities: Activity[];
  timeRange: "week" | "month" | "quarter";
}

export const ProgressChart = ({ selectedEmployee, activities, timeRange }: ProgressChartProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Individual Progress
        </CardTitle>
        <CardDescription>
          {selectedEmployee 
            ? `${selectedEmployee.name}'s activity progress over time`
            : 'Select an employee to view their progress'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedEmployee ? (
          <div>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {selectedEmployee.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-slate-800">{selectedEmployee.name}</h4>
                  <p className="text-sm text-slate-600">{selectedEmployee.department}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Total Activities</p>
                  <p className="text-lg font-semibold text-blue-600">{selectedEmployee.totalActivities}</p>
                </div>
                <div>
                  <p className="text-slate-600">Last Activity</p>
                  <p className="text-lg font-semibold text-green-600">
                    {selectedEmployee.lastActivity ? 
                      new Date(selectedEmployee.lastActivity).toLocaleDateString() : 
                      'No activities'
                    }
                  </p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={processEmployeeProgress(selectedEmployee, activities, timeRange)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="activities" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  name="Daily Activities"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Cumulative"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>Select an employee from the list to view their detailed progress</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
