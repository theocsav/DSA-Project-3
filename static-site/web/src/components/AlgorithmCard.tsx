import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';
import { commonStyles } from '../styles/common';

interface AlgorithmCardProps {
  title: string;
  icon: string;
  color: string;
  description: string;
  points: string[];
}

const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  title,
  icon,
  color,
  description,
  points
}) => {
  return (
    <Paper 
      elevation={8} 
      sx={{ 
        p: 4, 
        ...commonStyles.glassPanel,
        transition: 'all 0.3s', 
        color: 'white', 
        '&:hover': {
          transform: 'translateY(-5px)', 
          boxShadow: '0 15px 30px rgba(0,0,0,0.4)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ 
          mr: 2, 
          p: 2, 
          borderRadius: '50%', 
          background: color, 
          width: 60, 
          height: 60, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 8px 16px rgba(0,0,0,0.25)' 
        }}>
          <img 
            src={icon} 
            alt={`${title} icon`} 
            style={{ 
              width: '60%', 
              height: 'auto', 
              filter: 'brightness(0) invert(1)' 
            }} 
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.75rem' }}>
          {title}
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, mb: 3 }}>
        {description}
      </Typography>
      
      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Typography variant="h6" sx={{ color: color, mb: 2, fontWeight: 600 }}>
        Key Features:
      </Typography>
      
      {points.map((point, i) => (
        <Box key={i} sx={{ display: 'flex', mb: 2 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: color, 
            mt: 1, 
            mr: 2 
          }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {point}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

export default AlgorithmCard;