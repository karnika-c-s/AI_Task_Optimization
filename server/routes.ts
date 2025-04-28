import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertEmployeeSchema, 
  insertTaskSchema, 
  updateEmployeeSchema, 
  updateTaskSchema,
  taskStatusSchema,
  TaskStatus
} from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Main API routes for the task optimization system

  // === EMPLOYEE ENDPOINTS ===
  
  // Get all employees
  app.get("/api/employee/fetch", async (_req: Request, res: Response) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Error fetching employees", error });
    }
  });

  // Get employee by ID
  app.get("/api/employee/fetch/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }
      
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Error fetching employee", error });
    }
  });

  // Create employee
  app.post("/api/employee/register", async (req: Request, res: Response) => {
    try {
      const validationResult = insertEmployeeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid employee data", 
          errors: validationResult.error.format() 
        });
      }
      
      const newEmployee = await storage.createEmployee(validationResult.data);
      res.status(201).json(newEmployee);
    } catch (error) {
      res.status(500).json({ message: "Error creating employee", error });
    }
  });

  // Update employee
  app.patch("/api/employee/update/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }
      
      const validationResult = updateEmployeeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid employee data", 
          errors: validationResult.error.format() 
        });
      }
      
      const updatedEmployee = await storage.updateEmployee(id, validationResult.data);
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ message: "Error updating employee", error });
    }
  });

  // === TASK ENDPOINTS ===
  
  // Get all tasks
  app.get("/api/task/fetch", async (_req: Request, res: Response) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks", error });
    }
  });

  // Get task by ID
  app.get("/api/task/fetch/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task", error });
    }
  });

  // Get tasks by employee ID
  app.get("/api/task/fetch/employee/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }
      
      const tasks = await storage.getTasksByEmployeeId(id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks by employee ID", error });
    }
  });

  // Get tasks by status
  app.get("/api/task/fetch/status/:status", async (req: Request, res: Response) => {
    try {
      const status = req.params.status;
      const validationResult = taskStatusSchema.safeParse(status);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid task status" });
      }
      
      const tasks = await storage.getTasksByStatus(status);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks by status", error });
    }
  });

  // Create task
  app.post("/api/task/create", async (req: Request, res: Response) => {
    try {
      const validationResult = insertTaskSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: validationResult.error.format() 
        });
      }
      
      const newTask = await storage.createTask(validationResult.data);
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: "Error creating task", error });
    }
  });

  // Update task
  app.patch("/api/task/update/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const validationResult = updateTaskSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: validationResult.error.format() 
        });
      }
      
      const updatedTask = await storage.updateTask(id, validationResult.data);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // If task is completed, reduce employee workload
      if (updatedTask.status === TaskStatus.COMPLETED && updatedTask.assigned_employee_id) {
        const employee = await storage.getEmployee(updatedTask.assigned_employee_id);
        if (employee) {
          const newWorkload = Math.max(0, employee.current_workload - updatedTask.estimated_effort);
          await storage.updateEmployeeWorkload(employee.id, newWorkload);
        }
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task", error });
    }
  });

  // Update task status
  app.patch("/api/task/status/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const { status } = req.body;
      const validationResult = taskStatusSchema.safeParse(status);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid task status" });
      }
      
      const updatedTask = await storage.updateTaskStatus(id, status);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // If task is completed, reduce employee workload
      if (status === TaskStatus.COMPLETED && updatedTask.assigned_employee_id) {
        const employee = await storage.getEmployee(updatedTask.assigned_employee_id);
        if (employee) {
          const newWorkload = Math.max(0, employee.current_workload - updatedTask.estimated_effort);
          await storage.updateEmployeeWorkload(employee.id, newWorkload);
        }
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task status", error });
    }
  });

  // === ASSIGNMENT ENDPOINTS ===
  
  // Assign task to employee
  app.post("/api/assign/task", async (req: Request, res: Response) => {
    try {
      const { taskId, employeeId } = req.body;
      
      if (isNaN(taskId) || isNaN(employeeId)) {
        return res.status(400).json({ message: "Invalid task or employee ID" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Update task with new assignment
      const updatedTask = await storage.updateTaskAssignment(taskId, employeeId);
      
      // Update employee workload
      const newWorkload = employee.current_workload + (task.estimated_effort || 1);
      await storage.updateEmployeeWorkload(employeeId, newWorkload);
      
      res.json({ task: updatedTask, employee: { ...employee, current_workload: newWorkload } });
    } catch (error) {
      res.status(500).json({ message: "Error assigning task", error });
    }
  });

  // Auto-assign tasks to employees based on algorithms
  app.post("/api/assign/tasks", async (_req: Request, res: Response) => {
    try {
      // Get all unassigned tasks and employees
      const allTasks = await storage.getAllTasks();
      const unassignedTasks = allTasks.filter(
        task => task.status !== TaskStatus.COMPLETED && !task.assigned_employee_id
      );
      
      const employees = await storage.getAllEmployees();
      
      if (employees.length === 0) {
        return res.status(400).json({ message: "No employees available for assignment" });
      }
      
      // Call the Python API for task allocation
      const response = await axios.post("http://localhost:8000/api/algorithm/allocate-tasks", {
        tasks: unassignedTasks,
        employees: employees
      });
      
      const allocations = response.data.assignments;
      const updatedEmployees = response.data.updated_employees;
      
      // Update assignments in database
      const updatedTasks = [];
      for (const allocation of allocations) {
        const updatedTask = await storage.updateTaskAssignment(
          allocation.task_id, 
          allocation.employee_id
        );
        
        if (updatedTask) {
          updatedTasks.push(updatedTask);
        }
      }
      
      // Update employee workloads
      for (const employee of updatedEmployees) {
        await storage.updateEmployeeWorkload(employee.id, employee.current_workload);
      }
      
      res.json({ 
        message: `Successfully assigned ${allocations.length} tasks`,
        tasks: updatedTasks,
        employees: updatedEmployees
      });
    } catch (error) {
      res.status(500).json({ message: "Error auto-assigning tasks", error });
    }
  });

  // Balance workload
  app.post("/api/balance/workload", async (_req: Request, res: Response) => {
    try {
      // Get all tasks and employees
      const allTasks = await storage.getAllTasks();
      const activeTasks = allTasks.filter(task => task.status !== TaskStatus.COMPLETED);
      const employees = await storage.getAllEmployees();
      
      if (employees.length < 2) {
        return res.status(400).json({ message: "Need at least 2 employees to balance workload" });
      }
      
      // Call the Python API for workload balancing
      const response = await axios.post("http://localhost:8000/api/algorithm/balance-workload", {
        tasks: activeTasks,
        employees: employees
      });
      
      const reassignments = response.data.reassignments;
      const updatedEmployees = response.data.updated_employees;
      
      // Apply reassignments in database
      const updatedTasks = [];
      for (const reassignment of reassignments) {
        const updatedTask = await storage.updateTaskAssignment(
          reassignment.task_id, 
          reassignment.employee_id
        );
        
        if (updatedTask) {
          updatedTasks.push(updatedTask);
        }
      }
      
      // Update employee workloads
      for (const employee of updatedEmployees) {
        await storage.updateEmployeeWorkload(employee.id, employee.current_workload);
      }
      
      res.json({ 
        message: `Rebalanced workload with ${reassignments.length} task reassignments`,
        tasks: updatedTasks,
        employees: updatedEmployees
      });
    } catch (error) {
      res.status(500).json({ message: "Error balancing workload", error });
    }
  });

  // === URGENT TASK HANDLING ===
  
  // Handle urgent task
  app.post("/api/urgent/task", async (req: Request, res: Response) => {
    try {
      const { taskId } = req.body;
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Mark the task as urgent
      await storage.updateTaskUrgency(taskId, true);
      
      // Get employees and tasks for allocation
      const employees = await storage.getAllEmployees();
      const allTasks = await storage.getAllTasks();
      
      if (employees.length === 0) {
        return res.status(400).json({ message: "No employees available for urgent task" });
      }
      
      // Call the Python API for urgent task handling
      const response = await axios.post("http://localhost:8000/api/algorithm/handle-urgent", {
        urgent_task: task,
        tasks: allTasks,
        employees: employees
      });
      
      const assignment = response.data;
      
      // Update task assignment
      const updatedTask = await storage.updateTaskAssignment(taskId, assignment.employee_id);
      
      // Update employee's workload
      if (assignment.employee_id !== null) {
        const employee = await storage.getEmployee(assignment.employee_id);
        if (employee) {
          const newWorkload = employee.current_workload + (task.estimated_effort || 1);
          await storage.updateEmployeeWorkload(assignment.employee_id, newWorkload);
        }
      }
      
      res.json({ 
        message: "Urgent task handled",
        task: updatedTask,
        assigned_to: assignment.employee_id,
        impact_score: assignment.impact
      });
    } catch (error) {
      res.status(500).json({ message: "Error handling urgent task", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
