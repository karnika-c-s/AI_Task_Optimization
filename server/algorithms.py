from typing import List, Dict, Tuple, Any, Optional
import heapq
import json

# Task and Employee models
class Task:
    def __init__(self, task_id: int, title: str, priority: int, 
                 assigned_employee_id: Optional[int] = None,
                 dependencies: List[int] = None, 
                 urgency_flag: bool = False,
                 estimated_effort: int = 1,
                 status: str = "pending"):
        self.id = task_id
        self.title = title
        self.priority = priority
        self.assigned_employee_id = assigned_employee_id
        self.dependencies = dependencies or []
        self.urgency_flag = urgency_flag
        self.estimated_effort = estimated_effort
        self.status = status

class Employee:
    def __init__(self, employee_id: int, name: str, 
                 efficiency_score: float = 1.0, 
                 current_workload: int = 0):
        self.id = employee_id
        self.name = name
        self.efficiency_score = efficiency_score
        self.current_workload = current_workload

# Algorithm 1: Merge Sort for Task Sorting
def merge_sort_tasks(tasks: List[Task], key_func=lambda x: x.priority, reverse=True) -> List[Task]:
    """
    Sort tasks using merge sort algorithm based on a key function (default: priority, highest first)
    """
    if len(tasks) <= 1:
        return tasks
        
    # Split array into two halves
    mid = len(tasks) // 2
    left = merge_sort_tasks(tasks[:mid], key_func, reverse)
    right = merge_sort_tasks(tasks[mid:], key_func, reverse)
    
    # Merge sorted halves
    return merge(left, right, key_func, reverse)

def merge(left: List[Task], right: List[Task], key_func, reverse) -> List[Task]:
    """Helper function for merge_sort_tasks"""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if (key_func(left[i]) > key_func(right[j])) == reverse:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
            
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Algorithm 2: Min-Heap for Task Allocation
def allocate_tasks(tasks: List[Task], employees: List[Employee]) -> List[Dict]:
    """
    Allocate tasks to employees using a min-heap based on current workload and efficiency
    """
    if not employees:
        return []
    
    # Sort tasks by priority (highest first)
    sorted_tasks = merge_sort_tasks(tasks)
    
    # Create min-heap of employees based on adjusted workload (current / efficiency)
    employee_heap = [(e.current_workload / e.efficiency_score, e.id) for e in employees]
    heapq.heapify(employee_heap)
    
    assignments = []
    for task in sorted_tasks:
        if task.assigned_employee_id is not None or task.status == "completed":
            continue
            
        # Get employee with lowest workload
        _, employee_id = heapq.heappop(employee_heap)
        
        # Find employee object
        employee = next(e for e in employees if e.id == employee_id)
        
        # Update employee workload
        new_workload = employee.current_workload + task.estimated_effort
        employee.current_workload = new_workload
        
        # Add back to heap with updated workload
        heapq.heappush(employee_heap, (new_workload / employee.efficiency_score, employee_id))
        
        # Record the assignment
        assignments.append({
            "task_id": task.id,
            "employee_id": employee_id
        })
    
    return assignments

# Algorithm 3: Knapsack for Workload Balancing
def balance_workload(tasks: List[Task], employees: List[Employee]) -> List[Dict]:
    """
    Balance workload across employees using a knapsack-like algorithm
    """
    # Calculate average workload
    total_workload = sum(e.current_workload for e in employees)
    avg_workload = total_workload / len(employees) if employees else 0
    
    # Identify overloaded and underloaded employees
    overloaded = [e for e in employees if e.current_workload > avg_workload * 1.2]
    underloaded = [e for e in employees if e.current_workload < avg_workload * 0.8]
    
    if not overloaded or not underloaded:
        return []  # No rebalancing needed
    
    reassignments = []
    
    for over_emp in overloaded:
        # Get tasks assigned to overloaded employee
        emp_tasks = [t for t in tasks if t.assigned_employee_id == over_emp.id 
                    and t.status != "completed"]
        
        # Sort by estimated effort (smallest first for easy reassignment)
        emp_tasks.sort(key=lambda t: t.estimated_effort)
        
        # Target workload reduction
        excess = over_emp.current_workload - avg_workload
        
        for task in emp_tasks:
            if excess <= 0:
                break
                
            # Find best underloaded employee for this task
            best_employee = min(underloaded, 
                               key=lambda e: (e.current_workload + task.estimated_effort) / e.efficiency_score)
            
            # Check if reassignment makes sense
            if best_employee.current_workload + task.estimated_effort <= avg_workload * 1.1:
                # Record reassignment
                reassignments.append({
                    "task_id": task.id,
                    "employee_id": best_employee.id
                })
                
                # Update workloads
                best_employee.current_workload += task.estimated_effort
                over_emp.current_workload -= task.estimated_effort
                excess -= task.estimated_effort
    
    return reassignments

# Algorithm 4: Branch and Bound for Urgent Task Handling
def handle_urgent_task(urgent_task: Task, 
                      employees: List[Employee], 
                      tasks: List[Task]) -> Dict:
    """
    Find the best employee for an urgent task using Branch and Bound algorithm
    """
    if not employees:
        return {"task_id": urgent_task.id, "employee_id": None, "impact": 0}
    
    # Define our cost function (impact on current work)
    def calculate_impact(employee: Employee) -> float:
        # Impact is inversely proportional to efficiency and proportional to current workload
        return (employee.current_workload + urgent_task.estimated_effort) / employee.efficiency_score
    
    # Calculate impact for each employee
    impacts = [(calculate_impact(e), e.id) for e in employees]
    
    # Find employee with minimum impact
    min_impact, best_employee_id = min(impacts)
    
    return {
        "task_id": urgent_task.id,
        "employee_id": best_employee_id,
        "impact": min_impact
    }

# JSON Interface Functions for FastAPI
def sort_tasks_json(tasks_json: str) -> str:
    """
    Sort tasks by priority using merge sort
    """
    tasks_data = json.loads(tasks_json)
    tasks = [Task(**t) for t in tasks_data]
    
    sorted_tasks = merge_sort_tasks(tasks)
    
    # Convert back to dictionary format
    result = [vars(t) for t in sorted_tasks]
    return json.dumps(result)

def allocate_tasks_json(tasks_json: str, employees_json: str) -> str:
    """
    Allocate tasks to employees using min-heap
    """
    tasks_data = json.loads(tasks_json)
    employees_data = json.loads(employees_json)
    
    tasks = [Task(**t) for t in tasks_data]
    employees = [Employee(**e) for e in employees_data]
    
    assignments = allocate_tasks(tasks, employees)
    
    # Also return updated employee workloads
    updated_employees = [vars(e) for e in employees]
    
    return json.dumps({
        "assignments": assignments,
        "updated_employees": updated_employees
    })

def balance_workload_json(tasks_json: str, employees_json: str) -> str:
    """
    Balance workload among employees using knapsack
    """
    tasks_data = json.loads(tasks_json)
    employees_data = json.loads(employees_json)
    
    tasks = [Task(**t) for t in tasks_data]
    employees = [Employee(**e) for e in employees_data]
    
    reassignments = balance_workload(tasks, employees)
    
    # Also return updated employee workloads
    updated_employees = [vars(e) for e in employees]
    
    return json.dumps({
        "reassignments": reassignments,
        "updated_employees": updated_employees
    })

def handle_urgent_task_json(urgent_task_json: str, tasks_json: str, employees_json: str) -> str:
    """
    Handle urgent task using branch and bound
    """
    urgent_task_data = json.loads(urgent_task_json)
    tasks_data = json.loads(tasks_json)
    employees_data = json.loads(employees_json)
    
    urgent_task = Task(**urgent_task_data)
    tasks = [Task(**t) for t in tasks_data]
    employees = [Employee(**e) for e in employees_data]
    
    assignment = handle_urgent_task(urgent_task, employees, tasks)
    
    return json.dumps(assignment)
