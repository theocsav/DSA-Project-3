import React from 'react';
import { Box, Typography, CircularProgress, Divider, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid'; // Import Grid directly

interface MetricsPanelProps {
  data: any;
  isLoading: boolean;
  selectedModel: string;
  thresholds: {
    tree_count: number;
    sample_size: number;
    max_tree_depth: number;
    threshold: number;
  };
}

// Define props for MetricCard
interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ data, isLoading, selectedModel, thresholds }) => {
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>;
  }

  if (!data) {
    return <Typography>Run analysis to view metrics</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Performance Metrics Section */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          Performance Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Accuracy" 
              value={`${(data.accuracy * 100).toFixed(1)}%`} 
              description="Percentage of correct predictions"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Precision" 
              value={`${(data.precision * 100).toFixed(1)}%`} 
              description="True positives / (True positives + False positives)"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Recall" 
              value={`${(data.recall * 100).toFixed(1)}%`} 
              description="True positives / (True positives + False negatives)"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="F1 Score" 
              value={data.f1_score.toFixed(2)} 
              description="Harmonic mean of precision and recall"
            />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      
      {/* Model Parameters Section */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          Model Parameters
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Algorithm" 
              value={data.algorithm || selectedModel} 
              description="Detection method used"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label={selectedModel === 'Isolation Forest' ? 'Tree Count' : 'Number of Trees'} 
              value={data.parameters?.tree_count || data.parameters?.n_trees || thresholds.tree_count} 
              description="Number of trees in the ensemble"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Sample Size" 
              value={data.parameters?.sample_size || data.parameters?.min_samples_split || thresholds.sample_size} 
              description={selectedModel === 'Isolation Forest' ? "Samples per tree" : "Min samples to split a node"}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label={selectedModel === 'Isolation Forest' ? 'Threshold' : 'Max Depth'} 
              value={selectedModel === 'Isolation Forest' 
                ? data.parameters?.threshold || thresholds.threshold 
                : data.parameters?.max_depth || thresholds.max_tree_depth
              } 
              description={selectedModel === 'Isolation Forest' ? "Classification boundary" : "Maximum tree depth"}
            />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      
      {/* Execution Details */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          Execution Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Execution Time" 
              value={`${data.execution_time.toFixed(2)}s`} 
              description="Total processing time"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Data Points" 
              value={data.data_points.toLocaleString()} 
              description="Total transactions analyzed"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Fraud Count" 
              value={(data.fraud_count || data.fraud_transactions?.length || 0).toLocaleString()} 
              description="Transactions classified as fraud"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Data Structure" 
              value={data.data_structure || "Binary Trees"} 
              description="Underlying model structure"
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Extended Metrics Section - More Advanced Metrics */}
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          Advanced Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="False Positive Rate" 
              value={`${((data.confusion_matrix.false_positives / (data.confusion_matrix.false_positives + data.confusion_matrix.true_negatives)) * 100).toFixed(2)}%`} 
              description="False positives / (False positives + True negatives)"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="False Negative Rate" 
              value={`${((data.confusion_matrix.false_negatives / (data.confusion_matrix.false_negatives + data.confusion_matrix.true_positives)) * 100).toFixed(2)}%`} 
              description="False negatives / (False negatives + True positives)"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="True Positive Rate" 
              value={`${(data.recall * 100).toFixed(2)}%`} 
              description="Same as Recall"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="True Negative Rate" 
              value={`${((data.confusion_matrix.true_negatives / (data.confusion_matrix.true_negatives + data.confusion_matrix.false_positives)) * 100).toFixed(2)}%`} 
              description="True negatives / (True negatives + False positives)"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Metric Card component for displaying individual metrics
const MetricCard: React.FC<MetricCardProps> = ({ label, value, description }) => (
  <Tooltip title={description} placement="top">
    <Box sx={{
      bgcolor: 'rgba(30, 30, 70, 0.5)',
      p: 2,
      borderRadius: '8px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s',
      cursor: 'help',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      }
    }}>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', flexGrow: 1 }}>
        {value}
      </Typography>
    </Box>
  </Tooltip>
);

export default MetricsPanel;