import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  TextField 
} from '@mui/material';

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
}

const ModelSettingsDialog: React.FC<ModelSettingsDialogProps> = ({
  open,
  onClose,
  thresholds,
  handleThresholdsChange
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(28, 28, 63, 0.95) 0%, rgba(26, 26, 64, 0.95) 100%)',
          color: 'white',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }
      }}
    >
      <DialogContent sx={{ my: 2, px: 3, py: 3 }}>
        <Typography variant="h6" sx={{ 
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
          Model Hyperparameters
        </Typography>
        
        {(Object.keys(thresholds) as Array<keyof ThresholdValues>).map((field) => (
          <Box key={field} sx={{ position: 'relative', mb: 3.5 }}>
            <TextField
              fullWidth
              label={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              type="number"
              value={thresholds[field]}
              onChange={(e) => handleThresholdsChange(field, Number(e.target.value))}
              variant="outlined"
              sx={{
                my: 1,
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  color: '#2196F3',
                  fontWeight: 500,
                  fontSize: '1.05rem',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 0 15px rgba(33, 150, 243, 0.2)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 15px rgba(33, 150, 243, 0.3)',
                  },
                  '& fieldset': {
                    borderColor: 'rgba(33, 150, 243, 0.3)',
                    borderWidth: '1px',
                    borderRadius: '12px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(33, 150, 243, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(33, 150, 243, 0.8)',
                    borderWidth: '2px',
                  },
                  '& input': {
                    padding: '14px 16px',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2196F3',
                  }
                },
                '& .MuiInputAdornment-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                }
              }}
              InputProps={{
                endAdornment: field === 'threshold' ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }}>boundary</Typography>
                ) : field === 'tree_count' ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }}>trees</Typography>
                ) : field === 'sample_size' ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }}>samples</Typography>
                ) : field === 'max_tree_depth' ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }}>levels</Typography>
                ) : null
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                bottom: '-12px',
                left: '4px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.7rem',
              }}
            >
              {field === 'threshold' ? 'Classification boundary (higher = more strict)' : 
               field === 'tree_count' ? 'Number of decision trees in ensemble' : 
               field === 'sample_size' ? 'Data points per tree' : 
               'Maximum depth of each tree'}
            </Typography>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        pt: 1,
        mt: -5,
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
          onClick={onClose}
          variant="contained"
          sx={{ 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 10px rgba(33, 203, 243, .3)',
            borderRadius: '8px',
            px: 3,
            fontWeight: 500,
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelSettingsDialog;