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
  <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
    {isLine ? (
      <Box sx={{ width: 16, height: 2, bgcolor: color, borderRadius: 1, mr: 0.5 }} />
    ) : (
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mr: 0.5 }} />
    )}
    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
      {label}
    </Typography>
  </Box>
);

// Main Legend component
const Legend: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      <LegendItem color={COLORS.FRAUD} label="Fraud" />
      <LegendItem color={COLORS.NORMAL} label="Normal" />
      <LegendItem color={COLORS.MIXED} label="Mixed" />
      <LegendItem color={COLORS.SPLIT_LINE} label="Split" isLine={true} />
    </Box>
  );
};

export default Legend;