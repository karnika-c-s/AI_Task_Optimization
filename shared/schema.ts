import { pgTable, text, serial, integer, boolean, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Employee table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  efficiency_score: real("efficiency_score").notNull().default(1.0),
  current_workload: integer("current_workload").notNull().default(0),
});

// Define task status enum
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

// Task table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: integer("priority").notNull().default(1),
  status: text("status").notNull().default(TaskStatus.PENDING),
  assigned_employee_id: integer("assigned_employee_id").references(() => employees.id),
  dependencies: json("dependencies").$type<number[]>().default([]),
  urgency_flag: boolean("urgency_flag").notNull().default(false),
  estimated_effort: integer("estimated_effort").notNull().default(1), // Used for workload calculations
});

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  current_workload: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export const updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,
}).partial();

export const updateEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
}).partial();

// Zod validation for task status
export const taskStatusSchema = z.enum([
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS, 
  TaskStatus.COMPLETED
]);

// Type definitions
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type TaskStatusType = z.infer<typeof taskStatusSchema>;

// Types for algorithm input/output
export type TaskAssignment = {
  taskId: number;
  employeeId: number;
};

export type WorkloadBalance = {
  reassignments: TaskAssignment[];
};

export type UrgentAssignment = {
  taskId: number;
  employeeId: number;
  impact: number;
};
