import { Client } from "pg";

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "ai_task_automations",
  password: "Harihk@1106",
  port: 5432,
});

console.log("ashdfjafhdsk");
client.connect();

export default client;
