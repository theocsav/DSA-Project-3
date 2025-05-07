import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

interface TransactionsPanelProps {
  data: any;
  isLoading: boolean;
}

// Define transaction interface
interface Transaction {
  amt: number;
  distance_km: number;
  age: number;
  trans_hour: number;
  [key: string]: any; // Allow other fields
}

const TransactionsPanel: React.FC<TransactionsPanelProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>;
  }

  if (!data) {
    return <Typography>Run analysis to view transactions</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.8)' }}>
        Showing {Math.min(20, data.fraud_transactions?.length || 0)} of {data.fraud_transactions?.length || 0} fraud transactions 
        ({data.fraud_count ? ((data.fraud_count / data.data_points) * 100).toFixed(1) : 'N/A'}% of total)
      </Typography>
      
      {data.fraud_transactions && data.fraud_transactions.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          {data.fraud_transactions.slice(0, 20).map((transaction: Transaction, index: number) => (
            <Box
              key={index}
              sx={{
                p: 0.75,
                bgcolor: 'rgba(255,107,107,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255,107,107,0.2)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'normal',
                gap: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Amount: <strong>${transaction.amt?.toFixed(2)}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Distance: <strong>{transaction.distance_km?.toFixed(1)} km</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Age: <strong>{transaction.age?.toFixed(0)}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Hour: <strong>{transaction.trans_hour}:00</strong>
              </Typography>
            </Box>
          ))}
          {data.fraud_transactions.length > 20 && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 1 }}>
              Showing 20 of {data.fraud_transactions.length} fraud transactions
            </Typography>
          )}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ mt: 2 }}>
          No fraud transactions detected.
        </Typography>
      )}
    </Box>
  );
};

export default TransactionsPanel;