import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTasks, 
  autoAssignTasks, 
  balanceWorkload 
} from '@/store/slices/taskSlice';
import { fetchEmployees } from '@/store/slices/employeeSlice';
import { AppDispatch, RootState } from '@/store';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ListFilter, 
  PlusCircle, 
  Search, 
  SortDesc, 
  Shuffle, 
  LayoutGrid
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TaskStatus } from '@shared/schema';

const Tasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { employees } = useSelector((state: RootState) => state.employees);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchEmployees());
  }, [dispatch]);
  
  const refreshData = () => {
    dispatch(fetchTasks());
    dispatch(fetchEmployees());
  };
  
  const handleAutoAssign = async () => {
    try {
      await dispatch(autoAssignTasks()).unwrap();
      toast({
        title: "Tasks assigned",
        description: "Tasks have been automatically assigned to employees",
      });
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to assign tasks: ${error}`,
        variant: "destructive",
      });
    }
  };
  
  const handleBalanceWorkload = async () => {
    try {
      await dispatch(balanceWorkload()).unwrap();
      toast({
        title: "Workload balanced",
        description: "Workload has been balanced across employees",
      });
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to balance workload: ${error}`,
        variant: "destructive",
      });
    }
  };
  
  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Count tasks by status
  const pendingCount = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const inProgressCount = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Create, assign, and track tasks across your team
          </p>
        </div>
        
        <Dialog open={creatingTask} onOpenChange={setCreatingTask}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to assign to your team
              </DialogDescription>
            </DialogHeader>
            <TaskForm 
              employees={employees} 
              onSuccess={() => {
                setCreatingTask(false);
                refreshData();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter and search tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={!statusFilter ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter(null)}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={statusFilter === 'pending' ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending ({pendingCount})
                  </Badge>
                  <Badge
                    variant={statusFilter === 'in_progress' ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('in_progress')}
                  >
                    In Progress ({inProgressCount})
                  </Badge>
                  <Badge
                    variant={statusFilter === 'completed' ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('completed')}
                  >
                    Completed ({completedCount})
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Actions</div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleAutoAssign}
                    disabled={loading}
                  >
                    <SortDesc className="mr-2 h-4 w-4" />
                    Auto-Assign Tasks
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleBalanceWorkload}
                    disabled={loading}
                  >
                    <Shuffle className="mr-2 h-4 w-4" />
                    Balance Workload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Task List</CardTitle>
                <CardDescription>
                  Manage and track all tasks
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filteredTasks.length} tasks
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list">
                <TabsList className="mb-2">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="grid">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Grid View
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="list">
                  <TaskList 
                    tasks={filteredTasks} 
                    employees={employees}
                    onRefresh={refreshData}
                  />
                </TabsContent>
                
                <TabsContent value="grid">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.length === 0 ? (
                      <p className="col-span-full text-center text-muted-foreground py-4">
                        No tasks found. Create a new task or adjust your filters.
                      </p>
                    ) : (
                      filteredTasks.map(task => (
                        <Card key={task.id} className={task.urgency_flag ? "border-red-300" : ""}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{task.title}</CardTitle>
                              <Badge variant={
                                task.status === 'completed' ? "secondary" :
                                task.status === 'in_progress' ? "default" : "outline"
                              }>
                                {task.status}
                              </Badge>
                            </div>
                            {task.urgency_flag && (
                              <Badge variant="destructive" className="mt-2">Urgent</Badge>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description || "No description"}
                            </p>
                            <div className="text-sm">
                              <div className="flex justify-between">
                                <span>Priority:</span>
                                <span className="font-medium">{task.priority}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Assigned to:</span>
                                <span className="font-medium">
                                  {task.assigned_employee_id 
                                    ? employees.find(e => e.id === task.assigned_employee_id)?.name || 'Unknown' 
                                    : 'Unassigned'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Effort:</span>
                                <span className="font-medium">{task.estimated_effort || 1}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
