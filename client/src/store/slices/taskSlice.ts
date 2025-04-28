import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, InsertTask } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await apiRequest('GET', '/api/task/fetch');
  return await response.json() as Task[];
});

export const fetchTasksByEmployee = createAsyncThunk('tasks/fetchTasksByEmployee', 
  async (employeeId: number) => {
    const response = await apiRequest('GET', `/api/task/fetch/employee/${employeeId}`);
    return await response.json() as Task[];
  }
);

export const createTask = createAsyncThunk('tasks/createTask', 
  async (task: InsertTask) => {
    const response = await apiRequest('POST', '/api/task/create', task);
    return await response.json() as Task;
  }
);

export const updateTask = createAsyncThunk('tasks/updateTask', 
  async ({ id, data }: { id: number, data: Partial<Task> }) => {
    const response = await apiRequest('PATCH', `/api/task/update/${id}`, data);
    return await response.json() as Task;
  }
);

export const updateTaskStatus = createAsyncThunk('tasks/updateTaskStatus', 
  async ({ id, status }: { id: number, status: string }) => {
    const response = await apiRequest('PATCH', `/api/task/status/${id}`, { status });
    return await response.json() as Task;
  }
);

export const assignTask = createAsyncThunk('tasks/assignTask', 
  async ({ taskId, employeeId }: { taskId: number, employeeId: number }) => {
    const response = await apiRequest('POST', '/api/assign/task', { taskId, employeeId });
    return await response.json();
  }
);

export const autoAssignTasks = createAsyncThunk('tasks/autoAssignTasks', 
  async () => {
    const response = await apiRequest('POST', '/api/assign/tasks');
    return await response.json();
  }
);

export const balanceWorkload = createAsyncThunk('tasks/balanceWorkload', 
  async () => {
    const response = await apiRequest('POST', '/api/balance/workload');
    return await response.json();
  }
);

export const handleUrgentTask = createAsyncThunk('tasks/handleUrgentTask', 
  async (taskId: number) => {
    const response = await apiRequest('POST', '/api/urgent/task', { taskId });
    return await response.json();
  }
);

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      
      // Fetch tasks by employee
      .addCase(fetchTasksByEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByEmployee.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employee tasks';
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      })
      
      // Update task status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task status';
      })
      
      // Handle other task-related actions
      .addCase(assignTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.task.id);
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      })
      .addCase(autoAssignTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Update the tasks that were assigned
        action.payload.tasks.forEach((updatedTask: Task) => {
          const index = state.tasks.findIndex(task => task.id === updatedTask.id);
          if (index !== -1) {
            state.tasks[index] = updatedTask;
          }
        });
      })
      .addCase(balanceWorkload.fulfilled, (state, action) => {
        state.loading = false;
        // Update the tasks that were reassigned
        action.payload.tasks.forEach((updatedTask: Task) => {
          const index = state.tasks.findIndex(task => task.id === updatedTask.id);
          if (index !== -1) {
            state.tasks[index] = updatedTask;
          }
        });
      })
      .addCase(handleUrgentTask.fulfilled, (state, action) => {
        state.loading = false;
        // Update the urgent task
        const index = state.tasks.findIndex(task => task.id === action.payload.task.id);
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      });
  },
});

export const { clearTasksError } = taskSlice.actions;
export default taskSlice.reducer;
