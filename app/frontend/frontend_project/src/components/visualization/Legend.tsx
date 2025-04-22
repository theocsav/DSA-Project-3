import React from 'react';
import { Box, Typography } from '@mui/material';
import { COLORS } from './types';

// Helper component for legend items
interface LegendItemProps {
  color: string;
  label: string;
  isLine?: boolean; // To show a line instead of a circle
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, isLine = false }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    width: '80px', // Fixed width for all legend items
    height: '24px', // Fixed height for all legend items
    justifyContent: 'flex-start',
    mx: 1.5 // Increased margin for consistent spacing
  }}>
    {isLine ? (
      <Box sx={{ 
        width: 16, 
        height: 2, 
        bgcolor: color, 
        borderRadius: 1, 
        mr: 0.5,
        flexShrink: 0 // Prevent shrinking
      }} />
    ) : (
      <Box sx={{ 
        width: 10, 
        height: 10, 
        borderRadius: '50%', 
        bgcolor: color, 
        mr: 0.5,
        flexShrink: 0 // Prevent shrinking
      }} />
    )}
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.75rem', // Fixed font size
        fontWeight: 'normal', // Fixed font weight
        userSelect: 'none' // Prevent text selection affecting dimensions
      }}
    >
      {label}
    </Typography>
  </Box>
);

// Main Legend component
const Legend: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'nowrap', // Prevent wrapping that could change dimensions
      justifyContent: 'center',
      alignItems: 'center',
      height: '40px', // Fixed height
      width: '100%'
    }}>
      <LegendItem color={COLORS.FRAUD} label="Fraud" />
      <LegendItem color={COLORS.NORMAL} label="Normal" />
      <LegendItem color={COLORS.MIXED} label="Mixed" />
      <LegendItem color={COLORS.SPLIT_LINE} label="Split" isLine={true} />
    </Box>
  );
};

export default Legend;