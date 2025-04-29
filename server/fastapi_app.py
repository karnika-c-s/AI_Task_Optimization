from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn
from typing import List, Dict, Optional
from server.algorithms import (
    sort_tasks_json, 
    allocate_tasks_json, 
    balance_workload_json, 
    handle_urgent_task_json
)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For routes that need algorithm processing
@app.post("/api/algorithm/sort-tasks")
async def sort_tasks(tasks: List[Dict] = Body(...)):
    try:
        tasks_json = json.dumps(tasks)
        result = sort_tasks_json(tasks_json)
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/algorithm/allocate-tasks")
async def allocate_tasks(
    data: Dict = Body(...) # Should contain "tasks" and "employees" keys
):
    try:
        tasks_json = json.dumps(data.get("tasks", []))
        employees_json = json.dumps(data.get("employees", []))
        result = allocate_tasks_json(tasks_json, employees_json)
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/algorithm/balance-workload")
async def balance_workload(
    data: Dict = Body(...) # Should contain "tasks" and "employees" keys
):
    try:
        tasks_json = json.dumps(data.get("tasks", []))
        employees_json = json.dumps(data.get("employees", []))
        result = balance_workload_json(tasks_json, employees_json)
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/algorithm/handle-urgent")
async def handle_urgent(
    data: Dict = Body(...) # Should contain "urgent_task", "tasks" and "employees" keys
):
    try:
        urgent_task_json = json.dumps(data.get("urgent_task", {}))
        tasks_json = json.dumps(data.get("tasks", []))
        employees_json = json.dumps(data.get("employees", []))
        result = handle_urgent_task_json(urgent_task_json, tasks_json, employees_json)
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Start server
if __name__ == "__main__":
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=8000, reload=True)
