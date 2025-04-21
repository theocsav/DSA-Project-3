import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { TreeVisualizationProps, COLORS } from './types';
import Legend from './Legend';

// Update interface to include children prop
interface TreeVisualizationComponentProps extends TreeVisualizationProps {
  children: ReactNode;
}

// Base component for tree visualizations
const TreeVisualization: React.FC<TreeVisualizationComponentProps> = ({ 
  onComplete, 
  autoStart = false,
  thresholds,
  width = 600,
  height = 400,
  children
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <Box 
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Visualization area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        height: 'calc(100% - 40px)' // Reserve space for legend
      }}>
        {children}
      </Box>
      
      {/* Legend at the bottom */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        p: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '0 0 8px 8px',
        width: '100%',
        height: '40px'
      }}>
        <Legend />
      </Box>
    </Box>
  );
};

export default TreeVisualization;