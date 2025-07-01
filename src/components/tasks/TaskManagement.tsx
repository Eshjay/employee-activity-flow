
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, Clock, AlertCircle } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useProfiles } from "@/hooks/useProfiles";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskCard } from "./TaskCard";
import { useAuth } from "@/hooks/useAuth";

export const TaskManagement = () => {
  const { tasks, loading } = useTasks();
  const { profiles } = useProfiles();
  const { profile } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const canCreateTasks = profile?.role === 'ceo' || profile?.role === 'developer';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  const myTasks = tasks.filter(task => task.assigned_to === profile?.id);
  const assignedTasks = tasks.filter(task => task.assigned_by === profile?.id);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold">
                Task Management
              </CardTitle>
              <CardDescription>
                Assign and track tasks across your team
              </CardDescription>
            </div>
            {canCreateTasks && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{myTasks.length}</div>
              <div className="text-sm text-gray-600">My Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {myTasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {myTasks.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {myTasks.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Tasks Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Tasks ({myTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks assigned to you yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  canEdit={true}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Tasks Section (only for CEOs and Developers) */}
      {canCreateTasks && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Tasks I Assigned ({assignedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You haven't assigned any tasks yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignedTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    canEdit={true}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <CreateTaskDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        profiles={profiles}
      />
    </div>
  );
};
