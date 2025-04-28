import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Employee } from '@shared/schema';

interface EfficiencyChartProps {
  employees: Employee[];
}

const EFFICIENCY_RANGES = [
  { name: 'Low (<0.8)', range: [0, 0.8], color: 'var(--chart-5)' },
  { name: 'Medium (0.8-1.2)', range: [0.8, 1.2], color: 'var(--chart-3)' },
  { name: 'High (1.2-1.5)', range: [1.2, 1.5], color: 'var(--chart-2)' },
  { name: 'Excellent (>1.5)', range: [1.5, Infinity], color: 'var(--chart-1)' },
];

const EfficiencyChart: React.FC<EfficiencyChartProps> = ({ employees }) => {
  // Count employees in each efficiency range
  const efficiencyDistribution = EFFICIENCY_RANGES.map(range => {
    const count = employees.filter(
      emp => emp.efficiency_score >= range.range[0] && emp.efficiency_score < range.range[1]
    ).length;
    
    return {
      name: range.name,
      value: count,
      color: range.color
    };
  });

  // Filter out ranges with no employees
  const chartData = efficiencyDistribution.filter(item => item.value > 0);

  return (
    <div className="h-[300px] w-full">
      {employees.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No employee data available</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No efficiency data to display</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} employees`, 'Count']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EfficiencyChart;
