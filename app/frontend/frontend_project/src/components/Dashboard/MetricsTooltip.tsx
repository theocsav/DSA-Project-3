import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popper,
  Paper,
  Typography,
  ClickAwayListener,
  Fade
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { commonStyles } from '../../styles/common';

interface MetricsTooltipProps {
  metric: 'accuracy' | 'precision' | 'recall' | 'f1_score' | 'falsePositiveRate' | 'falseNegativeRate';
  value: number;
  fraudValue?: number; // Optional monetary value of fraud transactions
}

const MetricsTooltip: React.FC<MetricsTooltipProps> = ({ metric, value, fraudValue }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  
  // Use a consistent ID for accessibility
  const id = open ? `${metric}-popper` : undefined;
  
  // Define financial impact calculations and explanations per metric
  const getMetricInfo = () => {
    const avgFraudValue = fraudValue || 1000; // Default average fraud value if not provided
    
    switch(metric) {
      case 'accuracy':
        return {
          title: 'Accuracy',
          description: 'The percentage of all predictions (both fraud and non-fraud) that are correct.',
          impact: `High accuracy alone doesn't guarantee good fraud detection – in an imbalanced dataset with few fraud cases, a model could have high accuracy by always predicting "not fraud".`,
          calculation: 'Accuracy = (True Positives + True Negatives) / Total Transactions'
        };
      case 'precision':
        return {
          title: 'Precision',
          description: 'The percentage of transactions flagged as fraud that are actually fraudulent.',
          impact: `With ${(value * 100).toFixed(1)}% precision, of every 100 transactions the model flags as fraud, ${Math.round(value * 100)} are truly fraudulent and ${Math.round((1-value) * 100)} are legitimate transactions that were incorrectly flagged.`,
          financialContext: `Each false positive may cost ~$25 in investigation time and potential customer friction. At current precision, this represents approximately $${Math.round((1-value) * 100 * 25)} cost per 100 fraud alerts.`,
          calculation: 'Precision = True Positives / (True Positives + False Positives)'
        };
      case 'recall':
        return {
          title: 'Recall (Detection Rate)',
          description: 'The percentage of all actual fraud transactions that are correctly detected.',
          impact: `With ${(value * 100).toFixed(1)}% recall, the model catches ${Math.round(value * 100)} out of every 100 fraud attempts, but misses ${Math.round((1-value) * 100)}.`,
          financialContext: `At an average fraud value of $${avgFraudValue}, the missed fraud costs approximately $${Math.round((1-value) * 100 * avgFraudValue)} per 100 fraud attempts.`,
          calculation: 'Recall = True Positives / (True Positives + False Negatives)'
        };
      case 'f1_score':
        return {
          title: 'F1 Score',
          description: 'The harmonic mean of precision and recall, providing a balance between them.',
          impact: 'F1 score helps balance the trade-off between false positives and false negatives, especially important in fraud detection where both have financial consequences.',
          calculation: 'F1 Score = 2 × (Precision × Recall) / (Precision + Recall)'
        };
      case 'falsePositiveRate':
        return {
          title: 'False Positive Rate',
          description: 'The percentage of legitimate transactions incorrectly flagged as fraud.',
          impact: `With a ${(value * 100).toFixed(1)}% false positive rate, ${Math.round(value * 100)} out of every 100 legitimate transactions are incorrectly flagged as fraud.`,
          financialContext: `These false positives can damage customer relationships and waste investigative resources. Approximate cost: $${Math.round(value * 100 * 25)} per 100 legitimate transactions in operational costs.`,
          calculation: 'False Positive Rate = False Positives / (False Positives + True Negatives)'
        };
      case 'falseNegativeRate':
        return {
          title: 'False Negative Rate',
          description: 'The percentage of fraudulent transactions that are missed by the model.',
          impact: `With a ${(value * 100).toFixed(1)}% false negative rate, ${Math.round(value * 100)} out of every 100 fraud attempts go undetected.`,
          financialContext: `Direct financial impact of missed fraud: approximately $${Math.round(value * 100 * avgFraudValue)} per 100 fraud attempts, based on average fraud value.`,
          calculation: 'False Negative Rate = False Negatives / (False Negatives + True Positives)'
        };
      default:
        return {
          title: 'Metric Information',
          description: 'No specific information available for this metric.',
          impact: '',
          calculation: ''
        };
    }
  };
  
  const metricInfo = getMetricInfo();
  
  return (
    <>
      <IconButton 
        aria-describedby={id} 
        onClick={handleClick}
        size="small"
        sx={{ 
          color: 'rgba(255,255,255,0.7)',
          '&:hover': {
            color: commonStyles.colors.primary
          }
        }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
      
      <Popper 
        id={id} 
        open={open} 
        anchorEl={anchorEl}
        placement="top"
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <ClickAwayListener onClickAway={handleClose}>
              <Paper 
                sx={{ 
                  ...commonStyles.glassPanel,
                  p: 2, 
                  maxWidth: 320,
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
                }}
              >
                <Typography variant="subtitle1" sx={{ color: commonStyles.colors.primary, fontWeight: 600, mb: 1 }}>
                  {metricInfo.title}
                </Typography>
                
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                  {metricInfo.description}
                </Typography>
                
                {metricInfo.impact && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    <strong>Impact:</strong> {metricInfo.impact}
                  </Typography>
                )}
                
                {metricInfo.financialContext && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1,
                    p: 1.5,
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    mb: 2
                  }}>
                    <AttachMoneyIcon sx={{ color: 'rgba(0,230,118,0.8)', mt: 0.5 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      <strong>Financial Context:</strong> {metricInfo.financialContext}
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                  <strong>Calculation:</strong> {metricInfo.calculation}
                </Typography>
              </Paper>
            </ClickAwayListener>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default MetricsTooltip;