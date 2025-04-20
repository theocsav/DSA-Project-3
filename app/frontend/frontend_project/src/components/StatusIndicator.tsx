import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatusIndicatorProps {
  label: string;
  value: string | number;
  color?: string;
  highlight?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  label, 
  value, 
  color = "#2196F3",
  highlight = false 
}) => {
  if (highlight) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        background: `rgba(${color === '#ff6b6b' ? '255, 107, 107' : '33, 150, 243'}, 0.1)`,
        border: `1px solid rgba(${color === '#ff6b6b' ? '255, 107, 107' : '33, 150, 243'}, 0.2)`,
        borderRadius: '16px',
        px: 2,
        py: 0.5,
      }}>
        <Typography variant="body2" sx={{ color: `rgba(${color === '#ff6b6b' ? '255, 107, 107' : '33, 150, 243'}, 0.8)` }}>{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 700, color }}>{value}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>{label}</Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, color }}>{value}</Typography>
    </Box>
  );
};

export default StatusIndicator;