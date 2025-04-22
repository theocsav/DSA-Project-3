import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Chart, ChartConfiguration, ChartData, ScatterDataPoint, registerables } from 'chart.js'; // Import necessary types

Chart.register(...registerables);

interface PlotPoint {
  age: number;
  distance_km: number;
  is_fraud: boolean;
  amt?: number; // Optional amount
  trans_hour?: number; // Optional transaction hour
}

interface RawTransaction {
  age?: number | null;
  distance_km?: number | null;
  amt?: number | null;
  trans_hour?: number | null;
  is_fraud?: boolean | null;
  [key: string]: any; // Allow other potential fields
}

// Represents the expected structure of the analysis result from the API
interface AnalysisResult {
  fraud_transactions?: RawTransaction[];
  non_fraud_transactions?: RawTransaction[];
  all_transactions?: RawTransaction[]; 
  // Add other fields if needed (e.g., metrics, execution time)
}

// Props expected by the ScatterPlot component
interface ScatterPlotProps {
  data: AnalysisResult | null; // The analysis data or null if not available
  loading: boolean; // Flag indicating if data is currently being loaded
}

// Possible states for the plot rendering
type PlotStatus = 'loading' | 'ready' | 'no_data' | 'error' | 'initial';

// --- Color Constants for Styling ---
const normalColor = 'rgba(33, 150, 243, 0.7)'; // Blueish for non-fraud
const normalBorderColor = 'rgba(33, 150, 243, 1)';
const fraudColor = 'rgba(255, 99, 132, 0.7)'; // Reddish for fraud
const fraudBorderColor = 'rgba(255, 99, 132, 1)';
const textColor = 'rgba(255, 255, 255, 0.7)'; // General text
const textEmphasisColor = 'rgba(255, 255, 255, 0.9)'; // Titles, important text
const gridColor = 'rgba(255, 255, 255, 0.1)'; // Grid lines on the axes
const axisColor = 'rgba(255, 255, 255, 0.7)'; // Axis labels and ticks
const legendColor = 'rgba(255, 255, 255, 0.8)'; // Legend text
const tooltipBgColor = 'rgba(30, 30, 60, 0.9)'; // Tooltip background
const loadingSpinnerColor = '#2196F3'; // Color for the loading spinner

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, loading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null); // Ref for the canvas element
  const chartInstanceRef = useRef<Chart | null>(null); // Ref to store the Chart.js instance
  const [plotStatus, setPlotStatus] = useState<PlotStatus>('initial'); // Internal state for rendering logic
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Stores error messages

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("ScatterPlot (Chart.js): Canvas ref is not available.");
      return; // Exit if the canvas element isn't ready
    }

    // --- Destroy previous chart instance if it exists ---
    // This is crucial for preventing memory leaks and rendering issues on updates
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
      // console.log("ScatterPlot (Chart.js): Previous chart instance destroyed.");
    }

    setErrorMessage(null); // Reset error message on each run

    // --- Determine Status based on props ---
    if (loading) {
      setPlotStatus('loading');
      return; // Don't process data or render chart if loading
    }

    if (!data) {
      setPlotStatus('initial'); // Or 'no_data' if preferred when data is explicitly null after loading
      // console.log("ScatterPlot (Chart.js): No data provided.");
      return; // No data to process
    }

    // --- Data Processing ---
    console.log("ScatterPlot (Chart.js): Processing received data:", data); // Log incoming data
    let processedPoints: PlotPoint[] = [];
    try {
        let combinedTransactions: (RawTransaction & { is_fraud: boolean })[] = [];

        // Prefer separate arrays if available
        if (data.fraud_transactions || data.non_fraud_transactions) {
            console.log(`ScatterPlot (Chart.js): Found ${data.fraud_transactions?.length ?? 0} fraud and ${data.non_fraud_transactions?.length ?? 0} non-fraud transactions.`);
            const frauds = (data.fraud_transactions || []).map((t): RawTransaction & { is_fraud: boolean } => ({ ...t, is_fraud: true }));
            const nonFrauds = (data.non_fraud_transactions || []).map((t): RawTransaction & { is_fraud: boolean } => ({ ...t, is_fraud: false }));
            combinedTransactions = [...frauds, ...nonFrauds];
        }
        // Fallback to all_transactions if separate arrays aren't present
        else if (data.all_transactions) {
            console.log(`ScatterPlot (Chart.js): Found ${data.all_transactions.length} transactions in all_transactions.`);
            combinedTransactions = data.all_transactions.map(t => ({ ...t, is_fraud: typeof t.is_fraud === 'boolean' ? t.is_fraud : false })); // Ensure is_fraud is boolean
        }
        // Handle edge case where only fraud is present (as per original code)
        else if (data.fraud_transactions && data.fraud_transactions.length > 0) {
             console.warn("ScatterPlot (Chart.js): Only fraud_transactions found. Plotting only fraud points.");
             combinedTransactions = data.fraud_transactions.map(t => ({ ...t, is_fraud: true }));
        } else {
             console.warn("ScatterPlot (Chart.js): No transaction data found in expected formats (fraud_transactions, non_fraud_transactions, or all_transactions).");
        }


        // Filter and map to the structure needed for plotting
        processedPoints = combinedTransactions
            // Ensure essential fields (age, distance_km, is_fraud) are valid numbers/booleans
            .filter((t: RawTransaction): t is RawTransaction & { age: number; distance_km: number; is_fraud: boolean } =>
                typeof t.age === 'number' && !isNaN(t.age) &&
                typeof t.distance_km === 'number' && !isNaN(t.distance_km) &&
                typeof t.is_fraud === 'boolean'
            )
            // Map to the PlotPoint structure
            .map((t): PlotPoint => ({
                age: t.age,
                distance_km: t.distance_km,
                is_fraud: t.is_fraud,
                amt: typeof t.amt === 'number' && !isNaN(t.amt) ? t.amt : undefined, // Include if valid number
                trans_hour: typeof t.trans_hour === 'number' && !isNaN(t.trans_hour) ? t.trans_hour : undefined, // Include if valid number
            }));

        console.log(`ScatterPlot (Chart.js): Processed ${processedPoints.length} valid points.`);

        if (processedPoints.length === 0) {
            setPlotStatus('no_data');
            const msg = "No valid data points found for scatter plot (missing or invalid age, distance, or fraud status). Check API response structure and data validity.";
            setErrorMessage(msg);
            console.warn("ScatterPlot (Chart.js): " + msg);
        } else {
            setPlotStatus('ready'); // Data is processed and ready for charting
        }

    } catch (error) {
        setPlotStatus('error');
        const msg = "Error processing scatter plot data.";
        setErrorMessage(msg);
        console.error("ScatterPlot (Chart.js): " + msg, error);
        processedPoints = []; // Ensure no points are plotted on error
    }

    // --- Chart Rendering (only if status is 'ready' and we have points) ---
    if (plotStatus === 'ready' && processedPoints.length > 0) {
      // Separate points into fraud and non-fraud datasets for Chart.js
      const fraudData: ScatterDataPoint[] = processedPoints
        .filter(p => p.is_fraud)
        .map(p => ({ x: p.age, y: p.distance_km })); // Format for Chart.js {x, y}

      const nonFraudData: ScatterDataPoint[] = processedPoints
        .filter(p => !p.is_fraud)
        .map(p => ({ x: p.age, y: p.distance_km }));

      // *** ADDED LOGGING ***
      console.log(`ScatterPlot (Chart.js): Preparing chart with ${fraudData.length} fraud points and ${nonFraudData.length} non-fraud points.`);

      // Prepare chart data structure
      const chartData: ChartData<'scatter'> = {
        datasets: [
          {
            label: 'Non-Fraudulent',
            data: nonFraudData,
            backgroundColor: normalColor,
            borderColor: normalBorderColor,
            pointRadius: 4, // Slightly smaller radius for normal points
            pointBorderWidth: 1,
          },
          {
            label: 'Fraudulent',
            data: fraudData,
            backgroundColor: fraudColor,
            borderColor: fraudBorderColor,
            pointRadius: 6, // Slightly larger radius for fraud points to stand out
            pointBorderWidth: 1,
          },
        ],
      };

      // Prepare chart configuration
      const config: ChartConfiguration<'scatter'> = {
        type: 'scatter',
        data: chartData,
        options: {
          responsive: true, // Make chart responsive to container size
          maintainAspectRatio: false, // Allow chart to fill container height/width independently
          plugins: {
            legend: {
              position: 'top', // Position the legend at the top
              labels: {
                color: legendColor, // Legend text color
                usePointStyle: true, // Use point style (circle) in legend
              },
            },
            title: {
              display: true,
              text: 'Transaction Distance vs. Customer Age',
              color: textEmphasisColor, // Title color
              font: { size: 16 } // Title font size
            },
            tooltip: {
              enabled: true, // Ensure tooltips are enabled
              backgroundColor: tooltipBgColor, // Tooltip background
              titleColor: textEmphasisColor, // Tooltip title color
              bodyColor: textColor, // Tooltip body color
              padding: 10, // Padding inside tooltip
              callbacks: {
                  // Customize tooltip label
                  label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                          label += ': ';
                      }
                      if (context.parsed.x !== null && context.parsed.y !== null) {
                          // You could potentially access the original full data point here
                          // if you structure your data differently (e.g., pass original points)
                          // For now, just use parsed values from the chart context
                          label += `(Age: ${context.parsed.x}, Distance: ${context.parsed.y.toFixed(1)} km)`;
                      }
                      return label;
                  }
              }
            }
          },
          scales: {
            x: { // X-axis configuration
              type: 'linear', // Linear scale for age
              position: 'bottom',
              title: {
                display: true,
                text: 'Customer Age',
                color: axisColor, // X-axis title color
              },
              grid: {
                color: gridColor, // X-axis grid line color
              },
              ticks: {
                color: axisColor, // X-axis tick label color
              },
            },
            y: { // Y-axis configuration
              type: 'linear', // Linear scale for distance
              title: {
                display: true,
                text: 'Transaction Distance (km)',
                color: axisColor, // Y-axis title color
              },
              grid: {
                color: gridColor, // Y-axis grid line color
              },
              ticks: {
                color: axisColor, // Y-axis tick label color
                // Optional: Format y-axis ticks if needed
                // callback: function(value) {
                //     return value + ' km';
                // }
              },
            },
          },
          // Optional: Interaction settings if needed
          // interaction: {
          //   mode: 'nearest',
          //   axis: 'xy',
          //   intersect: false
          // }
        },
      };

      // Create the new chart instance and store it in the ref
      try {
        chartInstanceRef.current = new Chart(canvas, config);
        // console.log("ScatterPlot (Chart.js): New chart instance created successfully.");
      } catch (error) {
         console.error("ScatterPlot (Chart.js): Failed to create chart instance.", error);
         setPlotStatus('error');
         setErrorMessage("Failed to render the chart.");
      }
    }

    // No cleanup function needed here as destruction happens at the start of the effect

  // Dependencies: Re-run effect when input data, loading state changes.
  // plotStatus is included because the rendering logic depends on it, ensuring
  // the chart creation runs *after* status becomes 'ready'.
  }, [data, loading, plotStatus]);



  let content;
  switch (plotStatus) {
    case 'loading':
      content = (
        <Box sx={{ textAlign: 'center', color: textColor }}>
          <CircularProgress sx={{ color: loadingSpinnerColor }} size={40} />
          <Typography variant="body2" sx={{ mt: 1 }}>Loading Plot...</Typography>
        </Box>
      );
      break;
    case 'no_data':
      content = (
        <Typography variant="body2" sx={{ color: textColor, textAlign: 'center', p: 2 }}>
          {errorMessage || "No valid data points found for plot."}
        </Typography>
      );
      break;
    case 'error':
       content = (
        <Typography variant="body2" sx={{ color: fraudColor, textAlign: 'center', p: 2 }}>
          {errorMessage || "An error occurred while generating the plot."}
        </Typography>
      );
      break;
    case 'initial':
        content = (
         <Typography variant="body2" sx={{ color: textColor, textAlign: 'center', p: 2 }}>
           Run analysis to generate scatter plot data.
         </Typography>
       );
       break;
    case 'ready':
    default:
      // When ready, the canvas itself is the content, no overlay needed.
      content = null;
      break;
  }

  return (
    // Outer container ensures centering and relative positioning
    <Box
      sx={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', // Important for canvas sizing and hiding overflow
      }}
    >
      {/* Canvas Container - always present but might be hidden or moved out of flow */}
      <Box sx={{
          width: '100%', height: '100%',
          // Hide canvas visually if showing loader/message, but keep it in DOM for Chart.js
          visibility: plotStatus === 'ready' ? 'visible' : 'hidden',
          // Take out of layout flow if not ready, so overlay centers correctly
          position: plotStatus === 'ready' ? 'relative' : 'absolute',
      }}>
          {/* The canvas element where Chart.js will draw the plot */}
          <canvas ref={canvasRef} />
      </Box>


      {/* Display Loader or Messages overlay */}
      {/* This Box overlays the canvas area when content is not null */}
      {content && (
         <Box sx={{
             position: 'absolute', 
             top: 0, left: 0, right: 0, bottom: 0,
             display: 'flex', alignItems: 'center', justifyContent: 'center',

         }}>
            {content} {}
         </Box>
      )}
    </Box>
  );
};

export default ScatterPlot;
