import { 
  employees, 
  tasks, 
  type Employee, 
  type InsertEmployee, 
  type Task, 
  type InsertTask,
  TaskStatus
} from "@shared/schema";

// Storage interface for task optimization system
export interface IStorage {
  // Employee operations
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee | undefined>;
  updateEmployeeWorkload(id: number, workload: number): Promise<Employee | undefined>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByEmployeeId(employeeId: number): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  updateTaskStatus(id: number, status: string): Promise<Task | undefined>;
  updateTaskAssignment(id: number, employeeId: number | null): Promise<Task | undefined>;
  updateTaskUrgency(id: number, urgencyFlag: boolean): Promise<Task | undefined>;
  getTasksWithDependencies(): Promise<Task[]>;
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee>;
  private tasks: Map<number, Task>;
  private employeeIdCounter: number;
  private taskIdCounter: number;

  constructor() {
    this.employees = new Map();
    this.tasks = new Map();
    this.employeeIdCounter = 1;
    this.taskIdCounter = 1;
  }

  // Employee operations
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.employeeIdCounter++;
    const newEmployee: Employee = { 
      ...employee, 
      id, 
      current_workload: 0 
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, ...employeeData };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async updateEmployeeWorkload(id: number, workload: number): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, current_workload: workload };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByEmployeeId(employeeId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.assigned_employee_id === employeeId
    );
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.status === status
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, status };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskAssignment(id: number, employeeId: number | null): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, assigned_employee_id: employeeId };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskUrgency(id: number, urgencyFlag: boolean): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, urgency_flag: urgencyFlag };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async getTasksWithDependencies(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.dependencies && (task.dependencies as number[]).length > 0
    );
  }
}

export const storage = new MemStorage();
