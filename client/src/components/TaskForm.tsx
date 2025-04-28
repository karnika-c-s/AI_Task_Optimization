import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { createTask, updateTask } from '@/store/slices/taskSlice';
import { AppDispatch } from '@/store';
import { InsertTask, Task } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface TaskFormProps {
  existingTask?: Task;
  employees: { id: number; name: string }[];
  onSuccess?: () => void;
}

const taskFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  priority: z.coerce.number().min(1).max(10),
  status: z.string().optional(),
  assigned_employee_id: z.coerce.number().optional().nullable(),
  dependencies: z.array(z.number()).optional(),
  urgency_flag: z.boolean().default(false),
  estimated_effort: z.coerce.number().min(1).max(100)
});

const TaskForm: React.FC<TaskFormProps> = ({ existingTask, employees, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: existingTask ? {
      ...existingTask,
      dependencies: existingTask.dependencies as number[] || [],
    } : {
      title: '',
      description: '',
      priority: 1,
      status: 'pending',
      assigned_employee_id: null,
      dependencies: [],
      urgency_flag: false,
      estimated_effort: 1
    }
  });
  
  const onSubmit = async (data: z.infer<typeof taskFormSchema>) => {
    try {
      if (existingTask) {
        await dispatch(updateTask({ id: existingTask.id, data })).unwrap();
        toast({
          title: "Task updated",
          description: "The task was updated successfully",
        });
      } else {
        await dispatch(createTask(data as InsertTask)).unwrap();
        toast({
          title: "Task created",
          description: "The task was created successfully",
        });
        form.reset();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${existingTask ? 'update' : 'create'} task: ${error}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Task description" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority (1-10)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={10} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="estimated_effort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Effort (1-100)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={100} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {existingTask && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
{/* Employee assignment is now automatic */}
        
        <FormField
          control={form.control}
          name="urgency_flag"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Urgent Task</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Mark this task as urgent for immediate attention
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          {existingTask ? 'Update Task' : 'Create Task'}
        </Button>
      </form>
    </Form>
  );
};

export default TaskForm;
