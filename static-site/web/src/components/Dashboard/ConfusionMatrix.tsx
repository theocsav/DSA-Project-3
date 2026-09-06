import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

interface ConfusionMatrixPanelProps {
  data: any;
  isLoading: boolean;
}

// Define props for the RateBox component
interface RateBoxProps {
  label: string;
  value: string;
  goodValue: boolean;
}

const ConfusionMatrixPanel: React.FC<ConfusionMatrixPanelProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>;
  }

  if (!data) {
    return <Typography>Run analysis to view confusion matrix</Typography>;
  }

  // Calculate percentages for cell labels
  const total = data.confusion_matrix.true_positives + 
                data.confusion_matrix.false_positives + 
                data.confusion_matrix.false_negatives + 
                data.confusion_matrix.true_negatives;
                
  const tpPercent = ((data.confusion_matrix.true_positives / total) * 100).toFixed(1);
  const fpPercent = ((data.confusion_matrix.false_positives / total) * 100).toFixed(1);
  const fnPercent = ((data.confusion_matrix.false_negatives / total) * 100).toFixed(1);
  const tnPercent = ((data.confusion_matrix.true_negatives / total) * 100).toFixed(1);

  // Calculate performance rates
  const falsePositiveRate = ((data.confusion_matrix.false_positives / 
    (data.confusion_matrix.false_positives + data.confusion_matrix.true_negatives)) * 100).toFixed(2);
  
  const falseNegativeRate = ((data.confusion_matrix.false_negatives / 
    (data.confusion_matrix.false_negatives + data.confusion_matrix.true_positives)) * 100).toFixed(2);
  
  const truePositiveRate = ((data.confusion_matrix.true_positives / 
    (data.confusion_matrix.true_positives + data.confusion_matrix.false_negatives)) * 100).toFixed(2);
  
  const trueNegativeRate = ((data.confusion_matrix.true_negatives / 
    (data.confusion_matrix.true_negatives + data.confusion_matrix.false_positives)) * 100).toFixed(2);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 2
    }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
        Confusion Matrix
      </Typography>
      
      {/* Matrix Visualization */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        p: 2,
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
        {/* Matrix Headers */}
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Box sx={{ width: 120 }}></Box>
          <Box sx={{ 
            width: 120, 
            textAlign: 'center', 
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.875rem'
          }}>
            Predicted Fraud
          </Box>
          <Box sx={{ 
            width: 120, 
            textAlign: 'center', 
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.875rem'
          }}>
            Predicted Normal
          </Box>
        </Box>
        
        {/* First Row - True Positives & False Negatives */}
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ 
            width: 120, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            pr: 2,
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.875rem'
          }}>
            Actual Fraud
          </Box>
          
          {/* True Positives Cell */}
          <Box sx={{ 
            width: 120, 
            height: 100, 
            bgcolor: 'rgba(0,230,118,0.2)', 
            border: '1px solid rgba(0,230,118,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {data.confusion_matrix.true_positives}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'rgba(0,230,118,0.9)' }}>
              True Positives
            </Typography>
            <Typography variant="caption">
              {tpPercent}%
            </Typography>
          </Box>
          
          {/* False Negatives Cell */}
          <Box sx={{ 
            width: 120, 
            height: 100, 
            bgcolor: 'rgba(255,107,107,0.2)', 
            border: '1px solid rgba(255,107,107,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {data.confusion_matrix.false_negatives}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'rgba(255,107,107,0.9)' }}>
              False Negatives
            </Typography>
            <Typography variant="caption">
              {fnPercent}%
            </Typography>
          </Box>
        </Box>
        
        {/* Second Row - False Positives & True Negatives */}
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ 
            width: 120, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            pr: 2,
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.875rem'
          }}>
            Actual Normal
          </Box>
          
          {/* False Positives Cell */}
          <Box sx={{ 
            width: 120, 
            height: 100, 
            bgcolor: 'rgba(255,107,107,0.2)', 
            border: '1px solid rgba(255,107,107,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {data.confusion_matrix.false_positives}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'rgba(255,107,107,0.9)' }}>
              False Positives
            </Typography>
            <Typography variant="caption">
              {fpPercent}%
            </Typography>
          </Box>
          
          {/* True Negatives Cell */}
          <Box sx={{ 
            width: 120, 
            height: 100, 
            bgcolor: 'rgba(0,230,118,0.2)', 
            border: '1px solid rgba(0,230,118,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {data.confusion_matrix.true_negatives}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'rgba(0,230,118,0.9)' }}>
              True Negatives
            </Typography>
            <Typography variant="caption">
              {tnPercent}%
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Explanation of terms */}
      <Box sx={{ 
        width: '100%', 
        bgcolor: 'rgba(30, 30, 70, 0.5)', 
        borderRadius: '8px',
        p: 2,
        mt: 2
      }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
          Model Performance Rates
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'space-around',
        }}>
          <RateBox 
            label="True Positive Rate (Recall)" 
            value={`${truePositiveRate}%`} 
            goodValue={true} 
          />
          <RateBox 
            label="True Negative Rate (Specificity)" 
            value={`${trueNegativeRate}%`} 
            goodValue={true} 
          />
          <RateBox 
            label="False Positive Rate" 
            value={`${falsePositiveRate}%`} 
            goodValue={false} 
          />
          <RateBox 
            label="False Negative Rate" 
            value={`${falseNegativeRate}%`} 
            goodValue={false} 
          />
        </Box>
      </Box>
      
      {/* Explanation of confusion matrix */}
      <Box sx={{ 
        width: '100%', 
        bgcolor: 'rgba(30, 30, 70, 0.5)', 
        borderRadius: '8px',
        p: 2,
        mt: 2
      }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
          What does this mean?
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
          <strong>True Positives:</strong> Fraudulent transactions correctly identified as fraud.
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
          <strong>False Positives:</strong> Normal transactions incorrectly flagged as fraud (false alarms).
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
          <strong>False Negatives:</strong> Fraudulent transactions incorrectly identified as normal (missed fraud).
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <strong>True Negatives:</strong> Normal transactions correctly identified as normal.
        </Typography>
      </Box>
    </Box>
  );
};

// Component to display performance rates
const RateBox: React.FC<RateBoxProps> = ({ label, value, goodValue }) => (
  <Box sx={{ 
    textAlign: 'center',
    minWidth: '120px'
  }}>
    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
      {label}
    </Typography>
    <Typography 
      variant="body1" 
      sx={{ 
        fontWeight: 'bold', 
        color: goodValue 
          ? 'rgba(0,230,118,0.9)'  // Green for good values 
          : 'rgba(255,107,107,0.9)' // Red for bad values
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default ConfusionMatrixPanel;