
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { CreateTodoDialog } from "./CreateTodoDialog";
import { TodoCard } from "./TodoCard";

export const TodoManagement = () => {
  const { todos, loading } = useTodos();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading todos...</div>
      </div>
    );
  }

  const completedTodos = todos.filter(todo => todo.is_completed);
  const pendingTodos = todos.filter(todo => !todo.is_completed);
  const taskBasedTodos = todos.filter(todo => todo.task_id);
  const personalTodos = todos.filter(todo => !todo.task_id);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold">
                My Todo List
              </CardTitle>
              <CardDescription>
                Manage your personal tasks and assigned work
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
              <div className="text-sm text-gray-600">Total Todos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTodos.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingTodos.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{taskBasedTodos.length}</div>
              <div className="text-sm text-gray-600">From Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Todos */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Todos ({pendingTodos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending todos. Great job!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingTodos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completed Todos ({completedTodos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedTodos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateTodoDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
};
