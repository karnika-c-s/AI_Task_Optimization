import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '@/store/slices/taskSlice';
import { fetchEmployees } from '@/store/slices/employeeSlice';
import { AppDispatch, RootState } from '@/store';
import Dashboard from '@/components/Dashboard';
import UrgentTaskPanel from '@/components/UrgentTaskPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, BarChart } from 'lucide-react';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { employees } = useSelector((state: RootState) => state.employees);
  
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchEmployees());
  }, [dispatch]);
  
  const refreshData = () => {
    dispatch(fetchTasks());
    dispatch(fetchEmployees());
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            AI Task Optimization System - Overview and Analytics
          </p>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <UrgentTaskPanel tasks={tasks} onSuccess={refreshData} />
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Algorithm Performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Task Sorting</p>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Merge Sort Ready
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Task Allocation</p>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Min-Heap Ready
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Workload Balancing</p>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Knapsack Ready
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Urgent Handling</p>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Branch & Bound Ready
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Dashboard tasks={tasks} employees={employees} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Task Completion Trends</CardTitle>
                    <CardDescription>
                      This will show task completion over time (historical data not available in demo)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Historical data will be displayed here
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Efficiency Trends</CardTitle>
                    <CardDescription>
                      Employee efficiency over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Historical efficiency data will be displayed here
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Workload Balance</CardTitle>
                    <CardDescription>
                      Team workload distribution 
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Historical workload data will be displayed here
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Home;
