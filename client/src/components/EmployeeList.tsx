import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Employee } from '@shared/schema';
import { updateEmployee } from '@/store/slices/employeeSlice';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmployeeForm from './EmployeeForm';
import { Edit, MoreVertical, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface EmployeeListProps {
  employees: Employee[];
  taskCounts: Record<number, number>;
  onRefresh: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  taskCounts, 
  onRefresh 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const getEfficiencyRating = (score: number) => {
    if (score >= 1.5) return { label: "Excellent", variant: "default" as const };
    if (score >= 1.2) return { label: "Good", variant: "default" as const };
    if (score >= 0.8) return { label: "Average", variant: "secondary" as const };
    if (score >= 0.5) return { label: "Below Average", variant: "outline" as const };
    return { label: "Poor", variant: "destructive" as const };
  };

  const getWorkloadLevel = (workload: number) => {
    // Workload levels can be calibrated based on your application needs
    if (workload > 80) return { color: "bg-red-500", label: "Overloaded" };
    if (workload > 60) return { color: "bg-orange-500", label: "Heavy" };
    if (workload > 30) return { color: "bg-yellow-500", label: "Moderate" };
    return { color: "bg-green-500", label: "Light" };
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Efficiency</TableHead>
            <TableHead>Current Workload</TableHead>
            <TableHead>Assigned Tasks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No employees found. Create a new employee to get started.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => {
              const efficiencyRating = getEfficiencyRating(employee.efficiency_score);
              const workloadLevel = getWorkloadLevel(employee.current_workload);
              
              return (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {employee.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{employee.efficiency_score.toFixed(1)}</span>
                      <Badge variant={efficiencyRating.variant}>
                        {efficiencyRating.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{workloadLevel.label}</span>
                        <span>{employee.current_workload}</span>
                      </div>
                      <Progress 
                        value={Math.min(employee.current_workload, 100)} 
                        className={workloadLevel.color} 
                      />
                    </div>
                  </TableCell>
                  <TableCell>{taskCounts[employee.id] || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingEmployee(employee)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <EmployeeForm
              existingEmployee={editingEmployee}
              onSuccess={() => {
                setEditingEmployee(null);
                onRefresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeList;
