import { Client } from "pg";
import {
  type Employee,
  type InsertEmployee,
  type Task,
  type InsertTask,
} from "@shared/schema";

export interface IStorage {
  // Employee operations
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(
    id: number,
    employee: Partial<Employee>
  ): Promise<Employee | undefined>;
  updateEmployeeWorkload(
    id: number,
    workload: number
  ): Promise<Employee | undefined>;

  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByEmployeeId(employeeId: number): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  updateTaskStatus(id: number, status: string): Promise<Task | undefined>;
  updateTaskAssignment(
    id: number,
    employeeId: number | null
  ): Promise<Task | undefined>;
  updateTaskUrgency(
    id: number,
    urgencyFlag: boolean
  ): Promise<Task | undefined>;
  getTasksWithDependencies(): Promise<Task[]>;
}
export class PostgresStorage implements IStorage {
  private client: Client;

  constructor() {
    this.client = new Client({
      user: "postgres",
      host: "localhost",
      database: "ai_task_automations",
      password: "Harihk@1106",
      port: 5432,
    });

    this.client.connect();
  }

  // ---------- EMPLOYEE METHODS ----------

  async getEmployee(id: number): Promise<Employee | undefined> {
    const res = await this.client.query(
      "SELECT * FROM employees WHERE id = $1",
      [id]
    );
    return res.rows[0];
  }

  async getAllEmployees(): Promise<Employee[]> {
    const res = await this.client.query("SELECT * FROM employees");
    return res.rows;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const res = await this.client.query(
      `INSERT INTO employees (name, position, current_workload , efficiency_score)
       VALUES ($1, $2, $3 , $4)
       RETURNING *`,
      [employee.name, null, 0, employee.efficiency_score]
    );
    return res.rows[0];
  }

  async updateEmployee(
    id: number,
    employeeData: Partial<Employee>
  ): Promise<Employee | undefined> {
    const fields = Object.keys(employeeData);
    const values = Object.values(employeeData);

    if (fields.length === 0) return this.getEmployee(id);

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const res = await this.client.query(
      `UPDATE employees SET ${setClause} WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return res.rows[0];
  }

  async updateEmployeeWorkload(
    id: number,
    workload: number
  ): Promise<Employee | undefined> {
    const res = await this.client.query(
      "UPDATE employees SET current_workload = $1 WHERE id = $2 RETURNING *",
      [workload, id]
    );
    return res.rows[0];
  }

  // ---------- TASK METHODS ----------

  async getTask(id: number): Promise<Task | undefined> {
    const res = await this.client.query("SELECT * FROM tasks WHERE id = $1", [
      id,
    ]);
    return res.rows[0];
  }

  async getAllTasks(): Promise<Task[]> {
    const res = await this.client.query("SELECT * FROM tasks");
    return res.rows;
  }

  async getTasksByEmployeeId(employeeId: number): Promise<Task[]> {
    const res = await this.client.query(
      "SELECT * FROM tasks WHERE assigned_employee_id = $1",
      [employeeId]
    );
    return res.rows;
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    const res = await this.client.query(
      "SELECT * FROM tasks WHERE status = $1",
      [status]
    );
    return res.rows;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const res = await this.client.query(
      `INSERT INTO tasks (title, description, status, urgency_flag, assigned_employee_id, dependencies)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        task.title,
        task.description,
        task.status,
        task.urgency_flag ?? false,
        task.assigned_employee_id ?? null,
        task.dependencies ?? [],
      ]
    );
    return res.rows[0];
  }

  async updateTask(
    id: number,
    taskData: Partial<Task>
  ): Promise<Task | undefined> {
    const fields = Object.keys(taskData);
    const values = Object.values(taskData);

    if (fields.length === 0) return this.getTask(id);

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const res = await this.client.query(
      `UPDATE tasks SET ${setClause} WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return res.rows[0];
  }

  async updateTaskStatus(
    id: number,
    status: string
  ): Promise<Task | undefined> {
    const res = await this.client.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    return res.rows[0];
  }

  async updateTaskAssignment(
    id: number,
    employeeId: number | null
  ): Promise<Task | undefined> {
    const res = await this.client.query(
      "UPDATE tasks SET assigned_employee_id = $1 WHERE id = $2 RETURNING *",
      [employeeId, id]
    );
    return res.rows[0];
  }

  async updateTaskUrgency(
    id: number,
    urgencyFlag: boolean
  ): Promise<Task | undefined> {
    const res = await this.client.query(
      "UPDATE tasks SET urgency_flag = $1 WHERE id = $2 RETURNING *",
      [urgencyFlag, id]
    );
    return res.rows[0];
  }

  async getTasksWithDependencies(): Promise<Task[]> {
    const res = await this.client.query(
      "SELECT * FROM tasks WHERE array_length(dependencies, 1) > 0"
    );
    return res.rows;
  }
}

export const storage = new PostgresStorage();
