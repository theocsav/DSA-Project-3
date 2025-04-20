import React from 'react';
import { Paper, Grid, Typography, Box, Chip } from '@mui/material';
import { commonStyles } from '../../styles/common';

const TechnicalOverview: React.FC = () => (
  <Paper sx={{ 
    p: 4, 
    ...commonStyles.glassPanel
  }}>
    <Grid container spacing={4}>
      <Grid>
        <Typography variant="h6" sx={{ color: commonStyles.colors.primary, mb: 2 }}>Front-End Stack</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
          {['React', 'Vite', 'Material UI'].map(tech => (
            <Chip 
              key={tech} 
              label={tech} 
              sx={{ 
                background: 'rgba(33,150,243,0.1)', 
                color: commonStyles.colors.primary, 
                borderRadius: '8px', 
                border: '1px solid rgba(33,150,243,0.3)' 
              }} 
            />
          ))}
        </Box>
        <Typography variant="h6" sx={{ color: commonStyles.colors.primary, mb: 2 }}>Data Visualization</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Interactive charts and dashboards for real-time fraud monitoring and analysis.
        </Typography>
      </Grid>
      <Grid>
        <Typography variant="h6" sx={{ color: commonStyles.colors.secondary, mb: 2 }}>Back-End Stack</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
          {['Django', 'pandas', 'NumPy'].map(tech => (
            <Chip 
              key={tech} 
              label={tech} 
              sx={{ 
                background: 'rgba(0,230,118,0.1)', 
                color: commonStyles.colors.secondary, 
                borderRadius: '8px', 
                border: '1px solid rgba(0,230,118,0.3)' 
              }} 
            />
          ))}
        </Box>
        <Typography variant="h6" sx={{ color: commonStyles.colors.secondary, mb: 2 }}>ML Implementation</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Optimized Random Forest and Isolation Forest models with tunable parameters for optimal performance.
        </Typography>
      </Grid>
    </Grid>
  </Paper>
);

export default TechnicalOverview;