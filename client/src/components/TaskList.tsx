import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Task, TaskStatus } from '@shared/schema';
import { updateTaskStatus, assignTask, handleUrgentTask } from '@/store/slices/taskSlice';
import { AppDispatch } from '@/store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TaskForm from './TaskForm';
import { 
  CheckCircle,
  Clock,
  PlayCircle,
  MoreVertical,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskListProps {
  tasks: Task[];
  employees: { id: number; name: string }[];
  onRefresh: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, employees, onRefresh }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case TaskStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case TaskStatus.IN_PROGRESS:
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case TaskStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const handleStatusChange = async (taskId: number, status: string) => {
    try {
      await dispatch(updateTaskStatus({ id: taskId, status })).unwrap();
      toast({
        title: "Status updated",
        description: `Task status changed to ${status}`,
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update task status: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleEmployeeAssign = async (taskId: number, employeeId: string) => {
    try {
      if (employeeId === 'null') {
        // Handle unassigning
        await dispatch(updateTaskStatus({ 
          id: taskId, 
          status: TaskStatus.PENDING 
        })).unwrap();
      } else {
        await dispatch(assignTask({ 
          taskId, 
          employeeId: parseInt(employeeId) 
        })).unwrap();
      }
      toast({
        title: "Task assigned",
        description: employeeId === 'null' 
          ? "Task unassigned" 
          : `Task assigned to ${employees.find(e => e.id === parseInt(employeeId))?.name}`,
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to assign task: ${error}`,
        variant: "destructive",
      });
    }
  };

  const markAsUrgent = async (taskId: number) => {
    try {
      await dispatch(handleUrgentTask(taskId)).unwrap();
      toast({
        title: "Urgent task",
        description: "Task marked as urgent and assigned for immediate attention",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to mark task as urgent: ${error}`,
        variant: "destructive",
      });
    }
  };

  const getEmployeeName = (id: number | null) => {
    if (!id) return 'Unassigned';
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : 'Unknown';
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Effort</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No tasks found. Create a new task to get started.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id} className={task.urgency_flag ? "bg-red-50" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {task.title}
                    {task.urgency_flag && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.description.length > 50 
                        ? `${task.description.substring(0, 50)}...` 
                        : task.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={task.priority > 7 ? "destructive" : task.priority > 4 ? "default" : "outline"}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Select
                      defaultValue={task.status}
                      onValueChange={(value) => handleStatusChange(task.id, value)}
                      disabled={!task.assigned_employee_id}
                    >
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={task.assigned_employee_id?.toString() || 'null'}
                    onValueChange={(value) => handleEmployeeAssign(task.id, value)}
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue placeholder="Assign to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Unassigned</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {task.estimated_effort || 1}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTask(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!task.urgency_flag && (
                        <DropdownMenuItem onClick={() => markAsUrgent(task.id)}>
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          Mark Urgent
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              existingTask={editingTask}
              employees={employees}
              onSuccess={() => {
                setEditingTask(null);
                onRefresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
