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
        flexDirection: 'column',
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
        height: 'calc(100% - 40px)', // Leave space for legend
        overflow: 'hidden', // Prevent content from expanding the container
      }}>
        {children}
      </Box>
      
      {/* Legend at the bottom - Adding position absolute to keep it fixed regardless of zoom */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        p: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '0 0 8px 8px',
        width: '100%',
        height: '40px',
        minHeight: '40px', // Ensure minimum height
        maxHeight: '40px', // Ensure maximum height
        flexShrink: 0, // Prevent shrinking
        zIndex: 10, // Ensure legend stays on top
      }}>
        <Legend />
      </Box>
    </Box>
  );
};

export default TreeVisualization;