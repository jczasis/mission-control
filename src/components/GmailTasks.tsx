import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../types';
import { getTaskList, addTask, updateTaskStatus, getAuthorizationUrl, exchangeCodeForToken, getStoredToken } from '../lib/api/gmail';
import { CheckCircle2, Circle, Plus, Loader2, LogOut } from 'lucide-react';

export function GmailTasks() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredToken());
  const [authLoading, setAuthLoading] = useState(false);
  const queryClient = useQueryClient();

  // Verificar si hay un code en la URL y procesar OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      console.error('OAuth error:', error);
      setAuthLoading(false);
      return;
    }

    if (code && !isAuthenticated) {
      setAuthLoading(true);
      exchangeCodeForToken(code)
        .then(() => {
          setIsAuthenticated(true);
          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.pathname);
          // Refetch tasks
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          setAuthLoading(false);
        })
        .catch((err) => {
          console.error('Token exchange error:', err);
          setAuthLoading(false);
        });
    }
  }, [isAuthenticated, queryClient]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTaskList,
    refetchInterval: isAuthenticated ? 30000 : undefined, // Solo si autenticado
    retry: 1,
    enabled: isAuthenticated
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      updateTaskStatus(taskId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => addTask(title),
    onSuccess: () => {
      setNewTaskTitle('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addMutation.mutate(newTaskTitle);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getAuthorizationUrl();
  };

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    setIsAuthenticated(false);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Tareas Gmail</h2>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Desconectar Google"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {authLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      ) : !isAuthenticated ? (
        <div className="flex flex-col gap-3 items-center justify-center flex-1">
          <p className="text-gray-600 text-sm text-center">
            Conecta tu cuenta de Google para acceder a tus tareas
          </p>
          <button
            onClick={handleGoogleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Conectar con Google
          </button>
        </div>
      ) : (
        <>
          {/* Nueva tarea */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Nueva tarea..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTask}
              disabled={addMutation.isPending}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de tareas */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Sin tareas pendientes</p>
            ) : (
              tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(completed) =>
                    updateMutation.mutate({ taskId: task.id, completed })
                  }
                  isUpdating={updateMutation.isPending}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  isUpdating
}: {
  task: Task;
  onToggle: (completed: boolean) => void;
  isUpdating: boolean;
}) {
  return (
    <div
      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer group"
      onClick={() => onToggle(!task.completed)}
    >
      {task.completed ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-gray-600" />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            task.completed
              ? 'line-through text-gray-400'
              : 'text-gray-900'
          }`}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="text-xs text-gray-500 mt-0.5">{task.notes}</p>
        )}
      </div>
    </div>
  );
}
