import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Task } from '@shared/schema';
import { handleUrgentTask } from '@/store/slices/taskSlice';
import { AppDispatch } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UrgentTaskPanelProps {
  tasks: Task[];
  onSuccess: () => void;
}

const UrgentTaskPanel: React.FC<UrgentTaskPanelProps> = ({ tasks, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  
  // Filter tasks that can be marked as urgent (not already urgent and not completed)
  const eligibleTasks = tasks.filter(task => !task.urgency_flag && task.status !== 'completed');
  
  const handleUrgent = async () => {
    if (!selectedTaskId) {
      toast({
        title: "No task selected",
        description: "Please select a task to mark as urgent",
        variant: "destructive",
      });
      return;
    }
    
    const taskId = parseInt(selectedTaskId);
    
    try {
      setProcessing(true);
      await dispatch(handleUrgentTask(taskId)).unwrap();
      toast({
        title: "Task marked as urgent",
        description: "The task has been assigned for immediate attention",
      });
      setSelectedTaskId('');
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to process urgent task: ${error}`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Card className="border-red-300">
      <CardHeader className="bg-red-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-6 w-6 text-red-500" />
          <CardTitle>Urgent Task Panel</CardTitle>
        </div>
        <CardDescription>
          Assign high-priority tasks for immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {eligibleTasks.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No eligible tasks</AlertTitle>
            <AlertDescription>
              There are no non-urgent, incomplete tasks available to mark as urgent.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Task:</label>
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a task to mark as urgent" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Marking a task as urgent will automatically reassign it to the most suitable employee based on current workload and efficiency.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          onClick={handleUrgent}
          disabled={!selectedTaskId || processing || eligibleTasks.length === 0}
          className="w-full"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          {processing ? "Processing..." : "Mark as Urgent"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UrgentTaskPanel;
