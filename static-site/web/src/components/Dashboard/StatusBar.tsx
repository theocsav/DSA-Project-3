import React from 'react';
import { Box } from '@mui/material';
import StatusIndicator from '../StatusIndicator';
import { commonStyles } from '../../styles/common';

interface StatusBarProps {
  stats: {
    analyzedCount: string;
    time: string;
    accuracy: string;
    fraudPercentage: string;
  };
}

const StatusBar: React.FC<StatusBarProps> = ({ stats }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 'auto',
        minWidth: '500px',
        height: '52px',
        ...commonStyles.glassPanel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        px: 3,
        borderRadius: '26px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        zIndex: 100,
      }}
    >
      <StatusIndicator label="Analyzed" value={stats.analyzedCount} color={commonStyles.colors.primary} />
      <StatusIndicator label="Time" value={stats.time} color={commonStyles.colors.primary} />
      <StatusIndicator label="Accuracy" value={stats.accuracy} color={commonStyles.colors.secondary} />
      <StatusIndicator 
        label="Fraud" 
        value={stats.fraudPercentage} 
        color={commonStyles.colors.accent} 
        highlight={true}
      />
    </Box>
  );
};

export default StatusBar;