import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Employee } from '@shared/schema';

interface WorkloadChartProps {
  employees: Employee[];
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ employees }) => {
  // Prepare data for the chart
  const chartData = employees.map(employee => ({
    name: employee.name,
    workload: employee.current_workload,
    efficiency: parseFloat((employee.efficiency_score * 50).toFixed(1)), // Scale efficiency for visualization
  }));

  // Sort by workload for better visualization
  chartData.sort((a, b) => b.workload - a.workload);

  // Limit to top 10 for readability
  const displayData = chartData.slice(0, 10);

  return (
    <div className="h-[300px] w-full">
      {employees.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No employee data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'efficiency') {
                  return [parseFloat((value / 50).toFixed(1)), 'Efficiency Score'];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="workload" fill="var(--chart-1)" name="Workload" />
            <Bar yAxisId="right" dataKey="efficiency" fill="var(--chart-2)" name="Efficiency" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WorkloadChart;
