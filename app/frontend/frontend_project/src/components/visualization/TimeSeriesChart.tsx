import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { commonStyles } from '../../styles/common';

// Register Chart.js components
Chart.register(...registerables);

interface TimeSeriesChartProps {
  data: Array<{
    timeLabel: string;
    fraudCount: number;
    nonFraudCount: number;
    fraudAmount: number;
    nonFraudAmount: number;
  }>;
  timeUnit: 'hour' | 'day';
  dataType: 'count' | 'amount';
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, timeUnit, dataType }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  
  useEffect(() => {
    // Destroy previous chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    
    if (!chartRef.current || !data || data.length === 0) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Prepare data for the chart
    const labels = data.map(item => item.timeLabel);
    const fraudData = data.map(item => 
      dataType === 'count' ? item.fraudCount : item.fraudAmount
    );
    const nonFraudData = data.map(item => 
      dataType === 'count' ? item.nonFraudCount : item.nonFraudAmount
    );
    
    // Format y-axis label
    const yAxisLabel = dataType === 'count' 
      ? 'Number of Transactions' 
      : 'Transaction Amount ($)';
    
    // Create the chart - use type assertion for configuration
    const chartConfig = {
      type: 'bar' as const,
      data: {
        labels,
        datasets: [
          {
            label: 'Fraudulent',
            data: fraudData,
            backgroundColor: commonStyles.colors.accent,
            borderColor: commonStyles.colors.accent,
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.7,
          },
          {
            label: 'Normal',
            data: nonFraudData,
            backgroundColor: commonStyles.colors.primary,
            borderColor: commonStyles.colors.primary,
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.7,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false,
            backgroundColor: 'rgba(30, 30, 60, 0.95)',
            titleColor: '#ffffff',
            bodyColor: 'rgba(255, 255, 255, 0.8)',
            padding: 10, // Ensure this is a number
            cornerRadius: 8, // Ensure this is a number
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                
                if (dataType === 'amount') {
                  return `${label}: $${value.toLocaleString()}`;
                }
                return `${label}: ${value.toLocaleString()}`;
              }
            }
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: timeUnit === 'hour' ? 'Hour of Day' : 'Day of Week',
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
            }
          },
          y: {
            title: {
              display: true,
              text: yAxisLabel,
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              // Simplified callback that doesn't try to modify the values Chart.js uses internally
              callback: function(value: any) {
                // For display purposes only
                if (dataType === 'amount') {
                  // Return the formatted string WITH the $ symbol
                  return '$' + Number(value).toLocaleString();
                }
                // Return the value as is for count
                return value;
              }
            },
            beginAtZero: true,
          }
        },
        animation: {
          duration: 1000, // Ensure this is a number
        },
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
      }
    };
    
    // Create a new chart instance
    chartInstanceRef.current = new Chart(ctx, chartConfig);
    
    // Cleanup
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, timeUnit, dataType]);
  
  return (
    <canvas ref={chartRef} />
  );
};

export default TimeSeriesChart;