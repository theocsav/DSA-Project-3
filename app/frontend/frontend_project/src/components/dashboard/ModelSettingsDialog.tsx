import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  TextField,
  Divider,
  Slider,
  Tooltip,
  Paper
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { commonStyles } from '../../styles/common';

interface ThresholdValues {
  tree_count: number;
  sample_size: number;
  max_tree_depth: number;
  threshold: number;
}

interface ModelSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  thresholds: ThresholdValues;
  handleThresholdsChange: (field: keyof ThresholdValues, value: number) => void;
  currentMetrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    falsePositiveRate?: number;
    falseNegativeRate?: number;
    fraudCount?: number;
  };
  selectedModel: string;
  onRunModel: () => void;
}

const ModelSettingsDialog: React.FC<ModelSettingsDialogProps> = ({
  open,
  onClose,
  thresholds,
  handleThresholdsChange,
  currentMetrics,
  selectedModel,
  onRunModel
}) => {
  // Local state for all parameters
  const [localValues, setLocalValues] = useState<ThresholdValues>({...thresholds});
  const [predictedImpact, setPredictedImpact] = useState<any>(null);
  
  // Use ref to avoid dependency loops in useEffect
  const thresholdsRef = useRef(thresholds);
  const currentMetricsRef = useRef(currentMetrics);
  
  // Update refs when props change
  useEffect(() => {
    thresholdsRef.current = thresholds;
    currentMetricsRef.current = currentMetrics;
  }, [thresholds, currentMetrics]);
  
  // When dialog opens or thresholds change externally, update local values
  useEffect(() => {
    if (open) {
      setLocalValues({...thresholds});
    }
  }, [open, thresholds]);
  
  // Calculate predicted impact when local values change
  useEffect(() => {
    // Avoid calculation if no metrics available
    if (!currentMetricsRef.current) return;
    
    const calculatePredictedImpact = () => {
      const metrics = currentMetricsRef.current || {};
      const currentThresholds = thresholdsRef.current;
      
      // Safety defaults for metrics
      const accuracy = metrics.accuracy || 0.8;
      const falsePositiveRate = metrics.falsePositiveRate || 0.1;
      const falseNegativeRate = metrics.falseNegativeRate || 0.1;
      const fraudCount = metrics.fraudCount || 100;
      const f1Score = metrics.f1_score || 0.8;
      
      // Calculate relative changes from current settings
      const thresholdDiff = localValues.threshold / currentThresholds.threshold - 1; // proportional change
      const treeDiff = localValues.tree_count / currentThresholds.tree_count - 1;
      const sampleDiff = localValues.sample_size / currentThresholds.sample_size - 1;
      const depthDiff = localValues.max_tree_depth / currentThresholds.max_tree_depth - 1;
      
      // Model-specific impact calculation
      if (selectedModel === 'Isolation Forest') {
        // In Isolation Forest:
        // - Higher threshold = fewer anomalies detected = lower FP, higher FN
        // - More trees = more stability = slight improvement in all metrics
        // - Larger sample size = more representativeness = improved metrics
        return {
          accuracy: Math.min(1, Math.max(0, accuracy * (1 + 0.05 * treeDiff + 0.02 * sampleDiff - Math.abs(thresholdDiff) * 0.03))),
          falsePositiveRate: Math.min(1, Math.max(0, falsePositiveRate * (1 - thresholdDiff * 0.3 - treeDiff * 0.1 - sampleDiff * 0.05))),
          falseNegativeRate: Math.min(1, Math.max(0, falseNegativeRate * (1 + thresholdDiff * 0.4 - treeDiff * 0.1 - sampleDiff * 0.05))),
          fraudCount: Math.max(0, fraudCount * (1 - thresholdDiff * 0.3 + treeDiff * 0.05 + sampleDiff * 0.02)),
          f1Score: Math.min(1, Math.max(0, f1Score * (1 - Math.abs(thresholdDiff) * 0.1 + treeDiff * 0.08 + sampleDiff * 0.03)))
        };
      } else {
        // In Random Forest:
        // - More trees = better ensemble = improved metrics
        // - Larger max depth = more detailed patterns = better recall but potential overfitting
        // - Larger min samples split = more generalization = better precision but potential underfitting
        return {
          accuracy: Math.min(1, Math.max(0, accuracy * (1 + 0.08 * treeDiff + 0.02 * sampleDiff - Math.abs(depthDiff) * 0.03))),
          falsePositiveRate: Math.min(1, Math.max(0, falsePositiveRate * (1 - treeDiff * 0.15 + sampleDiff * 0.1 - depthDiff * 0.05))),
          falseNegativeRate: Math.min(1, Math.max(0, falseNegativeRate * (1 - treeDiff * 0.15 - sampleDiff * 0.05 + depthDiff * 0.1))),
          fraudCount: Math.max(0, fraudCount * (1 + treeDiff * 0.05 - sampleDiff * 0.03 + depthDiff * 0.07)),
          f1Score: Math.min(1, Math.max(0, f1Score * (1 + treeDiff * 0.1 + Math.min(sampleDiff, 0.2) * 0.05 - Math.abs(depthDiff > 0.3 ? depthDiff : 0) * 0.05)))
        };
      }
    };
    
    setPredictedImpact(calculatePredictedImpact());
  }, [localValues, selectedModel]); // Dependencies are now simpler and won't cause update loops
  
  // Update a single parameter
  const handleValueChange = (field: keyof ThresholdValues, value: number) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };
  
  // Apply all changes and run model
  const handleApply = () => {
    // Apply all changes at once
    Object.keys(localValues).forEach(key => {
      const field = key as keyof ThresholdValues;
      if (localValues[field] !== thresholds[field]) {
        handleThresholdsChange(field, localValues[field]);
      }
    });
    onClose();
    onRunModel();
  };
  
  // Get field description based on model and field name
  const getFieldDescription = (field: keyof ThresholdValues): string => {
    if (selectedModel === 'Isolation Forest') {
      switch (field) {
        case 'tree_count': return 'Number of isolation trees. More trees improve stability but increase computational cost.';
        case 'sample_size': return 'Number of samples used in each tree. Larger samples improve representation but increase time.';
        case 'threshold': return 'Anomaly score threshold. Higher values consider more transactions as normal.';
        case 'max_tree_depth': return 'Maximum tree depth limit. Controls how isolated points can become.';
        default: return '';
      }
    } else {
      switch (field) {
        case 'tree_count': return 'Number of decision trees in the forest. More trees increase accuracy and stability.';
        case 'sample_size': return 'Minimum samples required to split a node. Higher values prevent overfitting.';
        case 'max_tree_depth': return 'Maximum depth of each tree. Deeper trees capture more details but risk overfitting.';
        case 'threshold': return 'Classification threshold for prediction confidence.';
        default: return '';
      }
    }
  };
  
  // Get min/max values for each parameter
  const getFieldRange = (field: keyof ThresholdValues): [number, number] => {
    switch (field) {
      case 'tree_count': return [10, 500];
      case 'sample_size': return [10, 1000];
      case 'max_tree_depth': return [2, 30];
      case 'threshold': return [0.1, 0.9];
      default: return [0, 100];
    }
  };

  // Safety check before rendering impact preview (avoids null reference errors)
  const hasMetricsData = Boolean(currentMetrics && predictedImpact);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(28, 28, 63, 0.95) 0%, rgba(26, 26, 64, 0.95) 100%)',
          color: 'white',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogContent sx={{ my: 2, px: 3, py: 3 }}>
        <Typography variant="h5" sx={{ 
          mb: 3, 
          color: '#2196F3', 
          fontWeight: 600,
          position: 'relative',
          display: 'inline-block',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '40%',
            height: '2px',
            bottom: '-8px',
            left: '0',
            background: 'linear-gradient(90deg, #2196F3, transparent)'
          }
        }}>
          {selectedModel} Settings
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Parameter controls */}
          {Object.keys(localValues).map((key) => {
            const field = key as keyof ThresholdValues;
            const [min, max] = getFieldRange(field);
            const isRelevant = 
              field !== 'threshold' || selectedModel === 'Isolation Forest';
            
            // Skip irrelevant fields for the selected model
            if (!isRelevant) return null;
            
            return (
              <Box key={field} sx={{ position: 'relative' }}>
                <Typography variant="subtitle1" sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  <Typography variant="body2" sx={{ fontWeight: 'normal', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Current: {thresholds[field]}
                  </Typography>
                </Typography>
                
                <Box sx={{ px: 1, mb: 1 }}>
                  <Slider
                    value={localValues[field]}
                    onChange={(_, value) => handleValueChange(field, value as number)}
                    min={min}
                    max={max}
                    step={field === 'threshold' ? 0.01 : 1}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: min, label: min.toString() },
                      { value: max, label: max.toString() }
                    ]}
                    sx={{
                      color: commonStyles.colors.primary,
                      '& .MuiSlider-thumb': {
                        height: 20,
                        width: 20,
                      },
                      '& .MuiSlider-track': {
                        height: 6,
                        borderRadius: 3,
                      },
                      '& .MuiSlider-rail': {
                        height: 6,
                        borderRadius: 3,
                        opacity: 0.3,
                      },
                      '& .MuiSlider-mark': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '& .MuiSlider-markLabel': {
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <TextField
                    value={localValues[field]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && val >= min && val <= max) {
                        handleValueChange(field, val);
                      }
                    }}
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{
                      inputProps: { min, max, step: field === 'threshold' ? 0.01 : 1 }
                    }}
                    sx={{
                      width: '100px',
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(0, 0, 0, 0.2)',
                        color: commonStyles.colors.primary,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  />
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      maxWidth: '75%'
                    }}
                  >
                    {getFieldDescription(field)}
                  </Typography>
                </Box>
                
                {/* Show divider between parameters */}
                {field !== 'threshold' && <Divider sx={{ mt: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />}
              </Box>
            );
          })}
          
          {/* Impact preview - Only show if metrics data is available */}
          {hasMetricsData && (
            <Paper sx={{ 
              bgcolor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              borderRadius: '12px',
              p: 2,
              mt: 2
            }}>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, fontWeight: 500 }}>
                Predicted Impact
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {/* Accuracy Impact */}
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Accuracy
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                      {(predictedImpact.accuracy * 100).toFixed(1)}%
                    </Typography>
                    {currentMetrics?.accuracy && (
                      <Typography variant="caption" sx={{ 
                        color: predictedImpact.accuracy > (currentMetrics.accuracy || 0) 
                          ? 'rgba(0, 230, 118, 0.9)' 
                          : predictedImpact.accuracy < (currentMetrics.accuracy || 0)
                            ? 'rgba(255, 107, 107, 0.9)'
                            : 'rgba(255, 255, 255, 0.5)'
                      }}>
                        {predictedImpact.accuracy > (currentMetrics.accuracy || 0)
                          ? `+${((predictedImpact.accuracy - (currentMetrics.accuracy || 0)) * 100).toFixed(1)}%`
                          : predictedImpact.accuracy < (currentMetrics.accuracy || 0)
                            ? `${((predictedImpact.accuracy - (currentMetrics.accuracy || 0)) * 100).toFixed(1)}%`
                            : '0%'
                        }
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* F1 Score Impact */}
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    F1 Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                      {predictedImpact.f1Score.toFixed(2)}
                    </Typography>
                    {currentMetrics?.f1_score && (
                      <Typography variant="caption" sx={{ 
                        color: predictedImpact.f1Score > (currentMetrics.f1_score || 0) 
                          ? 'rgba(0, 230, 118, 0.9)' 
                          : predictedImpact.f1Score < (currentMetrics.f1_score || 0)
                            ? 'rgba(255, 107, 107, 0.9)'
                            : 'rgba(255, 255, 255, 0.5)'
                      }}>
                        {predictedImpact.f1Score > (currentMetrics.f1_score || 0)
                          ? `+${(predictedImpact.f1Score - (currentMetrics.f1_score || 0)).toFixed(2)}`
                          : predictedImpact.f1Score < (currentMetrics.f1_score || 0)
                            ? `${(predictedImpact.f1Score - (currentMetrics.f1_score || 0)).toFixed(2)}`
                            : '0'
                        }
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* False Positive Rate Impact */}
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    False Positive Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                      {(predictedImpact.falsePositiveRate * 100).toFixed(1)}%
                    </Typography>
                    {currentMetrics?.falsePositiveRate && (
                      <Typography variant="caption" sx={{ 
                        color: predictedImpact.falsePositiveRate < (currentMetrics.falsePositiveRate || 0) 
                          ? 'rgba(0, 230, 118, 0.9)' 
                          : predictedImpact.falsePositiveRate > (currentMetrics.falsePositiveRate || 0)
                            ? 'rgba(255, 107, 107, 0.9)'
                            : 'rgba(255, 255, 255, 0.5)'
                      }}>
                        {predictedImpact.falsePositiveRate < (currentMetrics.falsePositiveRate || 0)
                          ? `${((predictedImpact.falsePositiveRate - (currentMetrics.falsePositiveRate || 0)) * 100).toFixed(1)}%`
                          : predictedImpact.falsePositiveRate > (currentMetrics.falsePositiveRate || 0)
                            ? `+${((predictedImpact.falsePositiveRate - (currentMetrics.falsePositiveRate || 0)) * 100).toFixed(1)}%`
                            : '0%'
                        }
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* False Negative Rate Impact */}
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    False Negative Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                      {(predictedImpact.falseNegativeRate * 100).toFixed(1)}%
                    </Typography>
                    {currentMetrics?.falseNegativeRate && (
                      <Typography variant="caption" sx={{ 
                        color: predictedImpact.falseNegativeRate < (currentMetrics.falseNegativeRate || 0) 
                          ? 'rgba(0, 230, 118, 0.9)' 
                          : predictedImpact.falseNegativeRate > (currentMetrics.falseNegativeRate || 0)
                            ? 'rgba(255, 107, 107, 0.9)'
                            : 'rgba(255, 255, 255, 0.5)'
                      }}>
                        {predictedImpact.falseNegativeRate < (currentMetrics.falseNegativeRate || 0)
                          ? `${((predictedImpact.falseNegativeRate - (currentMetrics.falseNegativeRate || 0)) * 100).toFixed(1)}%`
                          : predictedImpact.falseNegativeRate > (currentMetrics.falseNegativeRate || 0)
                            ? `+${((predictedImpact.falseNegativeRate - (currentMetrics.falseNegativeRate || 0)) * 100).toFixed(1)}%`
                            : '0%'
                        }
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Detected Fraud Count */}
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Detected Fraud
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                      {Math.round(predictedImpact.fraudCount)}
                    </Typography>
                    {currentMetrics?.fraudCount && (
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(255, 255, 255, 0.5)'
                      }}>
                        {predictedImpact.fraudCount > (currentMetrics.fraudCount || 0)
                          ? `+${Math.round(predictedImpact.fraudCount - (currentMetrics.fraudCount || 0))}`
                          : predictedImpact.fraudCount < (currentMetrics.fraudCount || 0)
                            ? `${Math.round(predictedImpact.fraudCount - (currentMetrics.fraudCount || 0))}`
                            : '0'
                        }
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Financial Impact */}
                <Box sx={{ 
                  gridColumn: '1 / -1',
                  mt: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  p: 1.5,
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px'
                }}>
                  <AttachMoneyIcon sx={{ color: 'rgba(0,230,118,0.8)', mt: 0.5 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    <strong>Financial Impact:</strong> {' '}
                    {currentMetrics?.falsePositiveRate && currentMetrics?.falseNegativeRate && (
                      <>
                        Estimated cost savings of approximately ${Math.round(
                          // Cost of false positives (each costs $25)
                          25 * ((currentMetrics.falsePositiveRate || 0) - predictedImpact.falsePositiveRate) * 10000 +
                          // Cost of false negatives (each costs ~$1000)
                          1000 * ((currentMetrics.falseNegativeRate || 0) - predictedImpact.falseNegativeRate) * 100
                        )} per 10,000 transactions compared to current settings.
                      </>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        pt: 1,
        justifyContent: 'space-between'
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '8px',
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={handleApply}
          variant="contained"
          disabled={JSON.stringify(localValues) === JSON.stringify(thresholds)}
          sx={{ 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 10px rgba(33, 203, 243, .3)',
            borderRadius: '8px',
            px: 3,
            fontWeight: 500,
            '&.Mui-disabled': {
              background: 'rgba(33, 150, 243, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          Apply & Run
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelSettingsDialog;