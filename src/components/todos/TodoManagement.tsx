
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ListTodo, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { TodoCard } from "./TodoCard";
import { CreateTodoDialog } from "./CreateTodoDialog";
import { ConvertToActivityDialog } from "./ConvertToActivityDialog";
import type { Todo } from "@/hooks/useTodos";

export const TodoManagement = () => {
  const { todos, loading, createTodo } = useTodos();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [convertingTodo, setConvertingTodo] = useState<Todo | null>(null);

  const completedTodos = todos.filter(todo => todo.is_completed);
  const pendingTodos = todos.filter(todo => !todo.is_completed);

  const stats = [
    {
      title: "Total Todos",
      value: todos.length,
      icon: ListTodo,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Completed",
      value: completedTodos.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending",
      value: pendingTodos.length,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "High Priority",
      value: todos.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  const handleCreateTodo = async (todoData: Partial<Todo>) => {
    const success = await createTodo(todoData);
    if (success) {
      setIsCreateDialogOpen(false);
    }
    return success;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-medium">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Todo Management */}
      <Card className="border-0 shadow-medium">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-800">
              My Todos
            </CardTitle>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="btn-hover-lift"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <div className="text-center py-8">
              <ListTodo className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No todos yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first todo
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Todos */}
              {pendingTodos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-slate-800">Pending</h3>
                    <Badge variant="outline">{pendingTodos.length}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingTodos.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onConvertToActivity={setConvertingTodo}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Todos */}
              {completedTodos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-slate-800">Completed</h3>
                    <Badge variant="outline">{completedTodos.length}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {completedTodos.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onConvertToActivity={setConvertingTodo}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Todo Dialog */}
      <CreateTodoDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTodo}
      />

      {/* Convert to Activity Dialog */}
      {convertingTodo && (
        <ConvertToActivityDialog
          todo={convertingTodo}
          isOpen={!!convertingTodo}
          onClose={() => setConvertingTodo(null)}
        />
      )}
    </div>
  );
};
