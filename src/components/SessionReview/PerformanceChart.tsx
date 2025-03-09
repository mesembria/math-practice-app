// src/components/SessionReview/PerformanceChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Props interface matching the existing code structure
interface PerformanceChartProps {
  dates: string[];
  accuracy: number[];
  responseTime: number[];
}

type TooltipPayloadItem = {
  dataKey: string;
  name: string;
  value: number;
  payload: {
    date: string;
    accuracy: number | null;
    responseTime: number | null;
  };
  color?: string;
  fill?: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<TooltipPayloadItem>;
  label?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  dates,
  accuracy,
  responseTime
}) => {
  // Format date labels for x-axis
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Convert separate arrays to the array of objects format that Recharts needs
  const getChartData = () => {
    // If no data, return empty array
    if (!dates.length) return [];
    
    // Create data points from the separate arrays
    const chartData = dates.map((date, index) => ({
      date,
      accuracy: accuracy[index],
      responseTime: responseTime[index]
    }));
    
    // If there are fewer than 5 data points, pad with placeholders
    if (chartData.length < 5) {
      const paddedData = [...chartData];
      const neededPoints = 5 - chartData.length;
      
      // Get the earliest date in the data
      let earliestDate = new Date();
      if (chartData.length > 0) {
        earliestDate = new Date(chartData[0].date);
      }
      
      // Add placeholder points before the existing data
      for (let i = 0; i < neededPoints; i++) {
        const placeholderDate = new Date(earliestDate);
        placeholderDate.setDate(placeholderDate.getDate() - (i + 1) * 7); // Add weekly intervals
        
        paddedData.unshift({
          date: placeholderDate.toISOString().split('T')[0],
          accuracy: null as unknown as number,
          responseTime: null as unknown as number
        });
      }
      
      return paddedData;
    }
    
    return chartData;
  };

  // Format tooltip to show both metrics
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Filter out placeholder data points
      if (!payload.some((p: TooltipPayloadItem) => p.value !== null)) {
        return null;
      }
      
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-800">{formatDate(label || '')}</p>
          {payload.map((item: TooltipPayloadItem) => {
            if (item.value === null) return null;
            
            return (
              <p 
                key={item.dataKey}
                style={{ color: item.color }}
              >
                {item.name}: {' '}
                <span className="font-medium">
                  {item.dataKey === 'accuracy' 
                    ? `${item.value}%` 
                    : `${(item.value / 1000).toFixed(1)}s`}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // If no data, show placeholder
  if (!dates.length) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        <p>No performance data available</p>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="h-64 bg-white rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          
          {/* Primary Y-axis for accuracy % */}
          <YAxis
            yAxisId="accuracy"
            domain={[0, 100]}
            tickCount={6}
            tickFormatter={(value: number) => `${value}%`}
            stroke="#3b82f6"
            tick={{ fontSize: 12 }}
          />
          
          {/* Secondary Y-axis for response time */}
          <YAxis
            yAxisId="responseTime"
            orientation="right"
            domain={[0, 'dataMax + 1000']}
            tickFormatter={(value: number) => `${(value / 1000).toFixed(1)}s`}
            stroke="#ef4444"
            tick={{ fontSize: 12 }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value: string) => {
              return <span className="text-sm font-medium">{value}</span>;
            }}
          />
          
          <Line
            yAxisId="accuracy"
            type="monotone"
            dataKey="accuracy"
            name="Accuracy"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          
          <Line
            yAxisId="responseTime"
            type="monotone"
            dataKey="responseTime"
            name="Response Time"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;