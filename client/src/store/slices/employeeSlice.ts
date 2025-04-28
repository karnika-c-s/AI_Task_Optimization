import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Employee, InsertEmployee } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchEmployees = createAsyncThunk('employees/fetchEmployees', 
  async () => {
    const response = await apiRequest('GET', '/api/employee/fetch');
    return await response.json() as Employee[];
  }
);

export const fetchEmployeeById = createAsyncThunk('employees/fetchEmployeeById', 
  async (id: number) => {
    const response = await apiRequest('GET', `/api/employee/fetch/${id}`);
    return await response.json() as Employee;
  }
);

export const createEmployee = createAsyncThunk('employees/createEmployee', 
  async (employee: InsertEmployee) => {
    const response = await apiRequest('POST', '/api/employee/register', employee);
    return await response.json() as Employee;
  }
);

export const updateEmployee = createAsyncThunk('employees/updateEmployee', 
  async ({ id, data }: { id: number, data: Partial<Employee> }) => {
    const response = await apiRequest('PATCH', `/api/employee/update/${id}`, data);
    return await response.json() as Employee;
  }
);

// Employee slice
const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearEmployeesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      
      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        } else {
          state.employees.push(action.payload);
        }
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employee';
      })
      
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        state.employees.push(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create employee';
      })
      
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update employee';
      })
      
      // Handle workload updates from task actions
      .addCase('tasks/assignTask/fulfilled', (state, action) => {
        if (action.payload.employee) {
          const index = state.employees.findIndex(emp => emp.id === action.payload.employee.id);
          if (index !== -1) {
            state.employees[index] = action.payload.employee;
          }
        }
      })
      .addCase('tasks/autoAssignTasks/fulfilled', (state, action) => {
        if (action.payload.employees) {
          action.payload.employees.forEach((updatedEmployee: Employee) => {
            const index = state.employees.findIndex(emp => emp.id === updatedEmployee.id);
            if (index !== -1) {
              state.employees[index] = updatedEmployee;
            }
          });
        }
      })
      .addCase('tasks/balanceWorkload/fulfilled', (state, action) => {
        if (action.payload.employees) {
          action.payload.employees.forEach((updatedEmployee: Employee) => {
            const index = state.employees.findIndex(emp => emp.id === updatedEmployee.id);
            if (index !== -1) {
              state.employees[index] = updatedEmployee;
            }
          });
        }
      });
  },
});

export const { clearEmployeesError } = employeeSlice.actions;
export default employeeSlice.reducer;
