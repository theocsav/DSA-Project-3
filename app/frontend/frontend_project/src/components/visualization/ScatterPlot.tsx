import React, { useEffect, useState, useCallback } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Typography, Box, CircularProgress } from '@mui/material';
import { COLORS } from './types';
import { AnalysisResult } from '../../api/types';

// Define the data point structure
interface DataPoint {
  age: number;
  distance_km: number;
  score: number;
  is_fraud?: boolean;
}

interface ScatterPlotProps {
  data?: AnalysisResult;
  loading?: boolean;
  width?: number;
  height?: number;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ 
  data,
  loading = false,
  width = 600,
  height = 400
}) => {
  // State to hold processed scatter plot data
  const [scatterData, setScatterData] = useState<DataPoint[]>([]);
  const [domainX, setDomainX] = useState<[number, number]>([0, 100]);
  const [domainY, setDomainY] = useState<[number, number]>([0, 50]);
  
  // Process data from the API
  const processApiData = useCallback((analysisResult: AnalysisResult) => {
    if (!analysisResult || !analysisResult.features || !analysisResult.scores) {
      return [];
    }

    const processedData: DataPoint[] = [];
    const { features, scores, predictions } = analysisResult;
    
    features.forEach((feature, index) => {
      // Feature order from backend: [amt, distance_km, age, trans_hour]
      const age = feature[2];
      const distance = feature[1];
      const score = scores && scores[index] ? scores[index] : 0;
      const is_fraud = predictions && predictions[index] ? predictions[index] === 1 : false;
      
      processedData.push({
        age,
        distance_km: distance,
        score,
        is_fraud
      });
    });
    
    return processedData;
  }, []);
  
  // Generate some fake data initially (for testing)
  useEffect(() => {
    if (!data || !data.features || !data.scores) {
      // Generate fake data
      const fakeData: DataPoint[] = [];
      for (let i = 0; i < 100; i++) {
        // Create a pattern that resembles real data
        const age = Math.random() * 70 + 18;
        let distance_km = Math.random() * 50;
        
        // Make older people less likely to travel far (creates a pattern)
        if (age > 60) {
          distance_km = Math.random() * 25; // Shorter distances for older people
        }
        
        // Score based on unusual combinations
        let score = Math.random() * 0.3; // Default low score
        
        // Outliers: Young people traveling very far or old people traveling far
        if ((age < 30 && distance_km > 40) || (age > 65 && distance_km > 20)) {
          score = 0.5 + Math.random() * 0.5; // Higher anomaly score
        }
        
        const is_fraud = score > 0.6;
        
        fakeData.push({ age, distance_km, score, is_fraud });
      }
      
      setScatterData(fakeData);
      
      // Set domains based on fake data
      setDomainX([18, 88]);
      setDomainY([0, 50]);
    } else {
      // Process real data from API
      const processedData = processApiData(data);
      
      if (processedData.length > 0) {
        // Calculate domain boundaries
        const ages = processedData.map(d => d.age);
        const distances = processedData.map(d => d.distance_km);
        
        const minAge = Math.min(...ages);
        const maxAge = Math.max(...ages);
        const agePadding = (maxAge - minAge) * 0.05;
        
        const minDist = Math.min(...distances);
        const maxDist = Math.max(...distances);
        const distPadding = (maxDist - minDist) * 0.1;
        
        // Set domains with padding
        setDomainX([minAge - agePadding, maxAge + agePadding]);
        setDomainY([minDist - distPadding, maxDist + distPadding]);
        
        setScatterData(processedData);
      }
    }
  }, [data, processApiData]);

  // Function to get color based on anomaly score and fraud classification
  const getPointColor = (point: DataPoint) => {
    // If we have fraud classification from the model, use it as primary indicator
    if (point.is_fraud !== undefined) {
      return point.is_fraud ? COLORS.FRAUD : COLORS.NORMAL;
    }
    
    // Otherwise, fall back to score-based coloring
    if (point.score >= 0.8) return COLORS.FRAUD; // High anomaly (fraud) - Red
    if (point.score >= 0.6) return '#ff7043'; // Orange-red
    if (point.score >= 0.4) return '#ffab40'; // Amber
    if (point.score >= 0.2) return '#8e24aa'; // Purple
    return COLORS.NORMAL; // Low anomaly (normal) - Blue
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pointColor = getPointColor(data);
      
      return (
        <Box
          sx={{
            background: 'rgba(30, 30, 60, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            p: 1.5,
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontSize: '12px',
            color: 'white',
          }}
        >
          <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 0.5 }}>
            <strong>Age:</strong> {data.age.toFixed(1)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 0.5 }}>
            <strong>Distance:</strong> {data.distance_km.toFixed(1)} km
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'white', 
            display: 'block',
            '& span': { color: pointColor, fontWeight: 'bold' }
          }}>
            <strong>Anomaly Score:</strong> <span>{data.score.toFixed(3)}</span>
          </Typography>
          {data.is_fraud !== undefined && (
            <Typography variant="caption" sx={{ 
              color: 'white', 
              display: 'block',
              mt: 0.5,
              fontWeight: 'bold',
              color: data.is_fraud ? COLORS.FRAUD : 'lightgreen'
            }}>
              {data.is_fraud ? 'FRAUD DETECTED' : 'NORMAL TRANSACTION'}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  // Custom formatter for axis ticks
  const formatXAxis = (value: number) => `${value.toFixed(0)}`;
  const formatYAxis = (value: number) => `${value.toFixed(0)}`;

  // Custom legend component for anomaly score colors
  const ColorScaleLegend = () => {
    // Check if we're showing actual fraud predictions
    const hasClassification = scatterData.length > 0 && scatterData[0].is_fraud !== undefined;
    
    return (
      <Box sx={{ 
        position: 'absolute', 
        bottom: -5, 
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 1,
        p: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        zIndex: 100
      }}>
        {hasClassification ? (
          // Show fraud/normal classification
          <>
            <Typography variant="caption" sx={{ color: 'white', my: 'auto' }}>
              Classification:
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: COLORS.NORMAL
                  }} 
                />
                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.8rem' }}>
                  Normal
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: COLORS.FRAUD
                  }} 
                />
                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.8rem' }}>
                  Fraud
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          // Show anomaly score scale
          <>
            <Typography variant="caption" sx={{ color: 'white', my: 'auto' }}>
              Anomaly Score:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[
                { label: '0.0-0.2', color: COLORS.NORMAL, text: 'Low' },
                { label: '0.2-0.4', color: '#8e24aa', text: 'Low-Med' },
                { label: '0.4-0.6', color: '#ffab40', text: 'Medium' },
                { label: '0.6-0.8', color: '#ff7043', text: 'Med-High' },
                { label: '0.8-1.0', color: COLORS.FRAUD, text: 'High' }
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: item.color 
                    }} 
                  />
                  <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%' 
        }}>
          <CircularProgress size={40} sx={{ color: COLORS.NORMAL }} />
        </Box>
      ) : (
        <>
          <ColorScaleLegend />
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 60, left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis 
                type="number" 
                dataKey="age" 
                name="Age" 
                domain={domainX}
                tickFormatter={formatXAxis}
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                label={{ 
                  value: 'Age', 
                  position: 'insideBottom', 
                  offset: -10,
                  fill: 'rgba(255,255,255,0.8)',
                  style: { textAnchor: 'middle' }
                }}
              />
              <YAxis 
                type="number" 
                dataKey="distance_km" 
                name="Distance" 
                domain={domainY}
                tickFormatter={formatYAxis}
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                label={{ 
                  value: 'Distance (km)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -5,
                  fill: 'rgba(255,255,255,0.8)',
                  style: { textAnchor: 'middle' }
                }}
              />
              <ZAxis 
                type="number" 
                dataKey="score" 
                range={[20, 500]} 
                name="Score" 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Transactions" 
                data={scatterData}
                shape="circle"
              >
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getPointColor(entry)} 
                    fillOpacity={0.8}
                  />
                ))}
              </Scatter>
              <Legend 
                verticalAlign="bottom" 
                align="center"
                height={30}
                wrapperStyle={{
                  color: 'rgba(255,255,255,0.7)',
                  paddingBottom: '5px',
                  fontSize: '12px',
                  transform: 'translateY(15px)',
                  width: '50%',
                  margin: '0 auto'
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </>
      )}
    </Box>
  );
};

export default ScatterPlot;