import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, Employee, TaskStatus } from '@shared/schema';
import WorkloadChart from './WorkloadChart';
import EfficiencyChart from './EfficiencyChart';
import { AlarmClock, CheckCircle2, ListTodo, Users } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  employees: Employee[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, employees }) => {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const urgentTasks = tasks.filter(t => t.urgency_flag).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get most efficient employees (top 3)
  const topEmployees = [...employees]
    .sort((a, b) => b.efficiency_score - a.efficiency_score)
    .slice(0, 3);
  
  // Get employees with highest workload (top 3)
  const busyEmployees = [...employees]
    .sort((a, b) => b.current_workload - a.current_workload)
    .slice(0, 3);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Task Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTasks}</div>
          <p className="text-xs text-muted-foreground">
            {pendingTasks} pending, {inProgressTasks} in progress
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
          <AlarmClock className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{urgentTasks}</div>
          <p className="text-xs text-muted-foreground">
            Requiring immediate attention
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{employees.length}</div>
          <p className="text-xs text-muted-foreground">
            Active team members
          </p>
        </CardContent>
      </Card>
      
      {/* Workload Distribution Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Workload Distribution</CardTitle>
          <CardDescription>
            Current workload allocation across team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkloadChart employees={employees} />
        </CardContent>
      </Card>
      
      {/* Efficiency Metrics Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Efficiency Metrics</CardTitle>
          <CardDescription>
            Team member efficiency scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EfficiencyChart employees={employees} />
        </CardContent>
      </Card>
      
      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Team members with highest efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {topEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Efficiency: {employee.efficiency_score.toFixed(1)}
                    </p>
                  </div>
                  <Badge variant="secondary">Top Performer</Badge>
                </div>
              ))}
              {topEmployees.length === 0 && (
                <p className="text-sm text-muted-foreground">No employees available</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Heavy Workload */}
      <Card>
        <CardHeader>
          <CardTitle>Heavy Workload</CardTitle>
          <CardDescription>
            Team members with highest workload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {busyEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Workload: {employee.current_workload}
                    </p>
                  </div>
                  <Badge 
                    variant={employee.current_workload > 80 ? "destructive" : "default"}
                  >
                    {employee.current_workload > 80 ? "Overloaded" : "Busy"}
                  </Badge>
                </div>
              ))}
              {busyEmployees.length === 0 && (
                <p className="text-sm text-muted-foreground">No employees available</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
