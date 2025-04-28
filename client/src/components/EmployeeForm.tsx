import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { createEmployee, updateEmployee } from '@/store/slices/employeeSlice';
import { AppDispatch } from '@/store';
import { InsertEmployee, Employee } from '@shared/schema';
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
import { useToast } from '@/hooks/use-toast';

interface EmployeeFormProps {
  existingEmployee?: Employee;
  onSuccess?: () => void;
}

const employeeFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  efficiency_score: z.coerce
    .number()
    .min(0.1, { message: 'Efficiency must be at least 0.1' })
    .max(2.0, { message: 'Efficiency cannot exceed 2.0' })
});

const EmployeeForm: React.FC<EmployeeFormProps> = ({ existingEmployee, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: existingEmployee ? {
      ...existingEmployee
    } : {
      name: '',
      efficiency_score: 1.0
    }
  });
  
  const onSubmit = async (data: z.infer<typeof employeeFormSchema>) => {
    try {
      if (existingEmployee) {
        await dispatch(updateEmployee({ id: existingEmployee.id, data })).unwrap();
        toast({
          title: "Employee updated",
          description: "The employee information was updated successfully",
        });
      } else {
        await dispatch(createEmployee(data as InsertEmployee)).unwrap();
        toast({
          title: "Employee created",
          description: "The employee was added successfully",
        });
        form.reset();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${existingEmployee ? 'update' : 'create'} employee: ${error}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Employee name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="efficiency_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Efficiency Score (0.1-2.0)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1"
                  min={0.1} 
                  max={2.0} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          {existingEmployee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </form>
    </Form>
  );
};

export default EmployeeForm;
