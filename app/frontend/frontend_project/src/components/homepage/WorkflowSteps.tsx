import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { commonStyles } from '../../styles/common';

const WorkflowSteps: React.FC = () => {
  const steps = [
    { step: 1, title: 'Data Ingestion & Cleansing', description: 'Aggregate, clean, and prepare transaction data for analysis.' },
    { step: 2, title: 'Feature Engineering', description: 'Extract and normalize key attributes to enhance model performance.' },
    { step: 3, title: 'Model Evaluation', description: 'Train algorithms on historical data and score new transactions.' },
    { step: 4, title: 'Alert & Report', description: 'Flag suspicious activity, show patterns, and deliver insights.' }
  ];

  return (
    <Grid container spacing={3}>
      {steps.map(item => (
        <Grid key={item.step}>
          <Paper sx={{ 
            p: 3, 
            height: '100%', 
            ...commonStyles.glassPanel, 
            position: 'relative' 
          }}>
            <Typography variant="h1" sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -10, 
              fontSize: '120px', 
              fontWeight: 800, 
              opacity: 0.06, 
              color: '#fff' 
            }}>
              {item.step}
            </Typography>
            <Typography variant="h5" sx={{ color: commonStyles.colors.primary, mb: 1 }}>
              {item.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {item.description}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default WorkflowSteps;