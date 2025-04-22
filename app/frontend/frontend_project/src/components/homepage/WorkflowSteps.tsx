import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { commonStyles } from '../../styles/common';

const WorkflowSteps: React.FC = () => {
  const steps = [
    { step: 1, title: 'Data Ingestion & Cleansing', description: 'Aggregate, clean, and prepare transaction data for analysis through methods such as parsing data into relevant categories and handling inconsistent formatting. Properly sorts data into quantifiable isolation forest/random forest data to enable accurate tree generations.' },
    { step: 2, title: 'Feature Engineering', description: 'Extract and normalize key attributes to enhance model performance, including the time, location, and user behavior of each transaction. This step captures patterns and anomalies that are needed to distinguish real from fraudulent activity, optimizing accuracy.' },
    { step: 3, title: 'Model Evaluation', description: 'Trains algorithms on historical data and scores new transactions, allowing each algorithm to generate informed, accurate calculations and detections. Isolation forest determines fraud on ease of isolation from data while random forest continuously generates decision trees based on observed trends and history in the data' },
    { step: 4, title: 'Alert & Report', description: 'Flags suspicious activity, shows patterns, and delivers insights. Visualizes anomalies and models algorithm processes through interactive graphs. Guides user through the process of random tree generation and isolation forest insertions, outlining and visuzliaing anomaly detection.' }
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