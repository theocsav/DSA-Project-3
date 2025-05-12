import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { TreeVisualizationProps, COLORS } from './types';
import Legend from './Legend';

// Update interface to include children prop and zoom controls
interface TreeVisualizationComponentProps extends TreeVisualizationProps {
  children: ReactNode;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenter?: () => void;
  zoom?: number;
}

// Base component for tree visualizations
const TreeVisualization: React.FC<TreeVisualizationComponentProps> = ({ 
  onComplete, 
  autoStart = false,
  thresholds,
  width = 600,
  height = 400,
  children,
  onZoomIn,
  onZoomOut,
  onCenter,
  zoom = 1
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
      {/* Zoom controls */}
      {(onZoomIn || onZoomOut || onCenter) && (
        <Box sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(30, 30, 60, 0.7)',
          borderRadius: '8px',
          p: 0.5,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}>
          {onZoomIn && (
            <Tooltip title="Zoom In" placement="left">
              <IconButton 
                onClick={onZoomIn} 
                size="small" 
                sx={{ color: 'white', mb: 0.5 }}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onZoomOut && (
            <Tooltip title="Zoom Out" placement="left">
              <IconButton 
                onClick={onZoomOut} 
                size="small" 
                sx={{ color: 'white', mb: 0.5 }}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onCenter && (
            <Tooltip title="Center View" placement="left">
              <IconButton 
                onClick={onCenter} 
                size="small" 
                sx={{ color: 'white' }}
              >
                <CenterFocusStrongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {zoom && (
            <Box sx={{ 
              textAlign: 'center',
              color: 'white',
              fontSize: '0.7rem',
              mt: 0.5
            }}>
              {Math.round(zoom * 100)}%
            </Box>
          )}
        </Box>
      )}
      
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