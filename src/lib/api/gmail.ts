import { Task } from '../../types';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/tasks';

export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/callback`,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  try {
    // En producción, esto debería ir en un backend seguro
    // Por ahora, usamos el flujo del navegador
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${window.location.origin}/callback`,
        code,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const token = data.access_token;

    if (token) {
      localStorage.setItem('google_access_token', token);
      if (data.refresh_token) {
        localStorage.setItem('google_refresh_token', data.refresh_token);
      }
    }

    return token;
  } catch (error) {
    console.error('Error exchanging code:', error);
    throw error;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('google_access_token');
}

export async function getTaskList(): Promise<Task[]> {
  try {
    const token = getStoredToken();
    if (!token) return [];

    // Obtener listas de tareas
    const listResponse = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!listResponse.ok) throw new Error(`HTTP ${listResponse.status}`);

    const listData = await listResponse.json();
    const tasklists = listData.items || [];

    if (tasklists.length === 0) return [];

    const myTasksList = tasklists[0];

    // Obtener tareas
    const tasksResponse = await fetch(
      `https://www.googleapis.com/tasks/v1/lists/${myTasksList.id}/tasks?showCompleted=false`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!tasksResponse.ok) throw new Error(`HTTP ${tasksResponse.status}`);

    const tasksData = await tasksResponse.json();
    const tasks = tasksData.items || [];

    return tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      completed: task.status === 'completed',
      due: task.due,
      notes: task.notes
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function addTask(title: string, notes?: string): Promise<Task | null> {
  try {
    const token = getStoredToken();
    if (!token) return null;

    // Obtener listas
    const listResponse = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!listResponse.ok) throw new Error(`HTTP ${listResponse.status}`);

    const listData = await listResponse.json();
    const tasklists = listData.items || [];

    if (tasklists.length === 0) return null;

    const myTasksList = tasklists[0];

    // Crear tarea
    const newTaskResponse = await fetch(
      `https://www.googleapis.com/tasks/v1/lists/${myTasksList.id}/tasks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, notes })
      }
    );

    if (!newTaskResponse.ok) throw new Error(`HTTP ${newTaskResponse.status}`);

    const newTask = await newTaskResponse.json();

    return {
      id: newTask.id,
      title: newTask.title,
      completed: false,
      notes: newTask.notes
    };
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
}

export async function updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
  try {
    const token = getStoredToken();
    if (!token) return;

    // Obtener listas
    const listResponse = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!listResponse.ok) throw new Error(`HTTP ${listResponse.status}`);

    const listData = await listResponse.json();
    const tasklists = listData.items || [];
    const myTasksList = tasklists[0];

    // Actualizar tarea
    await fetch(
      `https://www.googleapis.com/tasks/v1/lists/${myTasksList.id}/tasks/${taskId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: completed ? 'completed' : 'needsAction' })
      }
    );
  } catch (error) {
    console.error('Error updating task status:', error);
  }
}
