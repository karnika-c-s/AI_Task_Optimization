import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '@/store/slices/employeeSlice';
import { fetchTasks } from '@/store/slices/taskSlice';
import { AppDispatch, RootState } from '@/store';
import EmployeeList from '@/components/EmployeeList';
import EmployeeForm from '@/components/EmployeeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Employees: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees } = useSelector((state: RootState) => state.employees);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { toast } = useToast();
  
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  
  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchTasks());
  }, [dispatch]);
  
  const refreshData = () => {
    dispatch(fetchEmployees());
    dispatch(fetchTasks());
  };
  
  // Count tasks per employee
  const taskCounts: Record<number, number> = {};
  tasks.forEach(task => {
    if (task.assigned_employee_id) {
      taskCounts[task.assigned_employee_id] = (taskCounts[task.assigned_employee_id] || 0) + 1;
    }
  });
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage team members and track efficiency metrics
          </p>
        </div>
        
        <Dialog open={creatingEmployee} onOpenChange={setCreatingEmployee}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Add a new team member to assign tasks to
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm 
              onSuccess={() => {
                setCreatingEmployee(false);
                refreshData();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                View and manage all employees
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {employees.length} employees
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <EmployeeList 
              employees={employees} 
              taskCounts={taskCounts}
              onRefresh={refreshData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Employees;
