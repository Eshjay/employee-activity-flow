
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Filter, Eye } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { format } from 'date-fns';

export const CEOTaskView = () => {
  const { tasks, loading } = useTasks();
  const { profiles } = useProfiles();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter tasks based on selected status
  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === selectedStatus);

  // Group tasks by status
  const tasksByStatus = {
    pending: tasks.filter(task => task.status === 'pending'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed'),
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = profiles.find(p => p.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading tasks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {tasksByStatus.pending.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  In Progress
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {tasksByStatus.in_progress.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900">
                <Eye className="w-5 h-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Completed
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {tasksByStatus.completed.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Total Tasks
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {tasks.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Tasks</span>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                            {task.title}
                          </h3>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Assigned to: {getEmployeeName(task.assigned_to)}</span>
                          </div>
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Created: {format(new Date(task.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
