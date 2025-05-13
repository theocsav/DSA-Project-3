import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Collapse,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TimeSeriesChart from '../visualization/TimeSeriesChart';
import { commonStyles } from '../../styles/common';

interface TransactionTimelineProps {
  data: any; // The analysis results containing transactions
  isLoading: boolean;
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ data, isLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const [timeUnit, setTimeUnit] = useState<'hour' | 'day'>('hour');
  const [timeseriesData, setTimeseriesData] = useState<any[]>([]);
  const [selectedDataType, setSelectedDataType] = useState<'count' | 'amount'>('count');
  
  useEffect(() => {
    if (!data || isLoading) return;
    
    // Process transaction data to create timeseries
    const processTransactions = () => {
      const fraudTransactions = data.fraud_transactions || [];
      const nonFraudTransactions = data.non_fraud_transactions || [];
      
      // Create hour bins (0-23)
      if (timeUnit === 'hour') {
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
          timeLabel: `${i}:00`,
          fraudCount: 0,
          nonFraudCount: 0,
          fraudAmount: 0,
          nonFraudAmount: 0
        }));
        
        // Fill in the fraudulent transaction counts by hour
        fraudTransactions.forEach((transaction: any) => {
          const hour = transaction.trans_hour || 0;
          if (hour >= 0 && hour <= 23) {
            hourlyData[hour].fraudCount += 1;
            hourlyData[hour].fraudAmount += transaction.amt || 0;
          }
        });
        
        // Fill in the non-fraudulent transaction counts by hour
        nonFraudTransactions.forEach((transaction: any) => {
          const hour = transaction.trans_hour || 0;
          if (hour >= 0 && hour <= 23) {
            hourlyData[hour].nonFraudCount += 1;
            hourlyData[hour].nonFraudAmount += transaction.amt || 0;
          }
        });
        
        setTimeseriesData(hourlyData);
      } 
      // Create day of week bins (0-6, Sunday to Saturday)
      else if (timeUnit === 'day') {
        const dailyData = Array.from({ length: 7 }, (_, i) => ({
          timeLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          fraudCount: 0,
          nonFraudCount: 0,
          fraudAmount: 0,
          nonFraudAmount: 0
        }));
        
        // In a real implementation, you would convert unix_time to day of week
        // For this example, we'll simulate with random distribution
        const allTransactions = [...fraudTransactions, ...nonFraudTransactions];
        
        allTransactions.forEach((transaction: any) => {
          // Use timestamp modulo to distribute transactions across days
          // This is just a simulation - real implementation would use proper date conversion
          const unixTime = transaction.unix_time || 0;
          const dayOfWeek = unixTime % 7;
          
          if (transaction.is_fraud === 1) {
            dailyData[dayOfWeek].fraudCount += 1;
            dailyData[dayOfWeek].fraudAmount += transaction.amt || 0;
          } else {
            dailyData[dayOfWeek].nonFraudCount += 1;
            dailyData[dayOfWeek].nonFraudAmount += transaction.amt || 0;
          }
        });
        
        setTimeseriesData(dailyData);
      }
    };
    
    processTransactions();
  }, [data, isLoading, timeUnit]);
  
  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };
  
  const handleTimeUnitChange = (event: SelectChangeEvent<'hour' | 'day'>) => {
    setTimeUnit(event.target.value as 'hour' | 'day');
  };
  
  const handleDataTypeChange = (event: SelectChangeEvent<'count' | 'amount'>) => {
    setSelectedDataType(event.target.value as 'count' | 'amount');
  };
  
  return (
    <Paper 
      elevation={3}
      sx={{
        ...commonStyles.glassPanel,
        width: '100%',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        mb: 0,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px rgba(100, 100, 255, 0.4)',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon sx={{ color: commonStyles.colors.primary, mr: 1.5 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
            Transaction Timeline
          </Typography>
          <Chip 
            label="New" 
            size="small" 
            sx={{ 
              ml: 1.5, 
              height: '20px', 
              bgcolor: 'rgba(0,230,118,0.2)', 
              color: 'rgba(0,230,118,0.9)',
              fontSize: '0.65rem',
              fontWeight: 'bold'
            }} 
          />
        </Box>
        
        <IconButton 
          onClick={handleExpandToggle}
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            View transaction patterns over time to identify potential coordinated fraud attempts or suspicious time-based patterns.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={timeUnit}
                  onChange={handleTimeUnitChange}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: commonStyles.colors.primary,
                    },
                    '& .MuiSelect-icon': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    }
                  }}
                >
                  <MenuItem value="hour">By Hour</MenuItem>
                  <MenuItem value="day">By Day</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedDataType}
                  onChange={handleDataTypeChange}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: commonStyles.colors.primary,
                    },
                    '& .MuiSelect-icon': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    }
                  }}
                >
                  <MenuItem value="count">Transaction Count</MenuItem>
                  <MenuItem value="amount">Transaction Amount</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Tooltip title="This visualization helps identify time patterns in fraudulent activity. For example, fraud may be more common during certain hours or days of the week.">
              <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%' 
              }}>
                <CircularProgress sx={{ color: commonStyles.colors.primary }} />
              </Box>
            ) : !data ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%'
              }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Run analysis to view transaction timeline
                </Typography>
              </Box>
            ) : (
              <TimeSeriesChart 
                data={timeseriesData} 
                timeUnit={timeUnit}
                dataType={selectedDataType}
              />
            )}
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: commonStyles.colors.accent,
                mr: 1
              }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Fraudulent Transactions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: commonStyles.colors.primary,
                mr: 1
              }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Normal Transactions
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>
      
      {!expanded && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Expand to view transaction patterns over time and identify suspicious time-based trends.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TransactionTimeline;