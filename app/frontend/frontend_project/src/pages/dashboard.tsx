import React, { useState, useRef, useEffect } from 'react';
import { Box, CssBaseline, GlobalStyles, IconButton, Tooltip, Typography, Paper, Tabs, Tab, Modal, Button, Fade, CircularProgress, Divider } from '@mui/material';

// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableChartIcon from '@mui/icons-material/TableChart';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import Settings from '@mui/icons-material/Settings';
import PlayArrow from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/InfoOutlined';

// Import our custom components
import Sidebar from '../components/Dashboard/Sidebar';
import ModelSettingsDialog from '../components/Dashboard/ModelSettingsDialog';
import TeamDialog from '../components/Dashboard/TeamDialog';
import TransactionTimeline from '../components/Dashboard/TransactionTimeline';
import { TeamMember } from '../components/TeamMemberCard';
import { commonStyles, animations } from '../styles/common';
import { AnalysisResult, IsolationForestParams, RandomForestParams } from '../api/types';
import { useIsolationForestAnalysis, useRandomForestAnalysis } from '../api/queries';

// Visualization components
import IsolationForestTree from '../components/visualization/IsolationForestTree';
import RandomForestTree from '../components/visualization/RandomForestTree';
import ScatterPlot from '../components/visualization/ScatterPlot';

// Constants
const drawerWidth = 240;

// --- Component: TransactionsPanel ---
interface TransactionsPanelProps {
  data: any;
  isLoading: boolean;
}

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

// --- Component: MetricCard ---
interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
}

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

// --- Component: MetricsPanel ---
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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
          <MetricCard
            label="Accuracy"
            value={`${(data.accuracy * 100).toFixed(1)}%`}
            description="Percentage of correct predictions"
          />
          <MetricCard
            label="Precision"
            value={`${(data.precision * 100).toFixed(1)}%`}
            description="True positives / (True positives + False positives)"
          />
          <MetricCard
            label="Recall"
            value={`${(data.recall * 100).toFixed(1)}%`}
            description="True positives / (True positives + False negatives)"
          />
          <MetricCard
            label="F1 Score"
            value={data.f1_score.toFixed(2)}
            description="Harmonic mean of precision and recall"
          />
        </Box>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* Model Parameters Section */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          Model Parameters
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
          <MetricCard
            label="Algorithm"
            value={data.algorithm || selectedModel}
            description="Detection method used"
          />
          <MetricCard
            label={selectedModel === 'Isolation Forest' ? 'Tree Count' : 'Number of Trees'}
            value={data.parameters?.tree_count || data.parameters?.n_trees || thresholds.tree_count}
            description="Number of trees in the ensemble"
          />
          <MetricCard
            label="Sample Size"
            value={data.parameters?.sample_size || data.parameters?.min_samples_split || thresholds.sample_size}
            description={selectedModel === 'Isolation Forest' ? "Samples per tree" : "Min samples to split a node"}
          />
          <MetricCard
            label={selectedModel === 'Isolation Forest' ? 'Threshold' : 'Max Depth'}
            value={selectedModel === 'Isolation Forest'
              ? data.parameters?.threshold || thresholds.threshold
              : data.parameters?.max_depth || thresholds.max_tree_depth
            }
            description={selectedModel === 'Isolation Forest' ? "Classification boundary" : "Maximum tree depth"}
          />
        </Box>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* Execution Details */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          Execution Details
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
          <MetricCard
            label="Execution Time"
            value={`${data.execution_time.toFixed(2)}s`}
            description="Total processing time"
          />
          <MetricCard
            label="Data Points"
            value={data.data_points.toLocaleString()}
            description="Total transactions analyzed"
          />
          <MetricCard
            label="Fraud Count"
            value={(data.fraud_count || data.fraud_transactions?.length || 0).toLocaleString()}
            description="Transactions classified as fraud"
          />
          <MetricCard
            label="Data Structure"
            value={data.data_structure || "Binary Trees"}
            description="Underlying model structure"
          />
        </Box>
      </Box>

      {/* Extended Metrics Section - More Advanced Metrics */}
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          Advanced Metrics
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
          <MetricCard
            label="False Positive Rate"
            value={`${((data.confusion_matrix.false_positives / (data.confusion_matrix.false_positives + data.confusion_matrix.true_negatives)) * 100).toFixed(2)}%`}
            description="False positives / (False positives + True negatives)"
          />
          <MetricCard
            label="False Negative Rate"
            value={`${((data.confusion_matrix.false_negatives / (data.confusion_matrix.false_negatives + data.confusion_matrix.true_positives)) * 100).toFixed(2)}%`}
            description="False negatives / (False negatives + True positives)"
          />
          <MetricCard
            label="True Positive Rate"
            value={`${(data.recall * 100).toFixed(2)}%`}
            description="Same as Recall"
          />
          <MetricCard
            label="True Negative Rate"
            value={`${((data.confusion_matrix.true_negatives / (data.confusion_matrix.true_negatives + data.confusion_matrix.false_positives)) * 100).toFixed(2)}%`}
            description="True negatives / (True negatives + False positives)"
          />
        </Box>
      </Box>
    </Box>
  );
};

// --- Component: RateBox ---
interface RateBoxProps {
  label: string;
  value: string;
  goodValue: boolean;
}

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

// --- Component: ConfusionMatrixPanel ---
interface ConfusionMatrixPanelProps {
  data: any;
  isLoading: boolean;
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

// Component for a minimal sidebar toggle (appears when sidebar is collapsed)
const MiniSidebar: React.FC<{
  onClick: () => void;
  selectedModel: string;
  onModelSelect: (model: string) => void;
  onRunModel: () => void;
  onSettingsClick: () => void;
}> = ({ onClick, selectedModel, onModelSelect, onRunModel, onSettingsClick }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '50px',
        backgroundColor: 'rgba(26, 26, 64, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2,
        backdropFilter: 'blur(10px)',
      }}
    >
      <IconButton
        onClick={onClick}
        sx={{
          color: 'white',
          mb: 3,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      <Tooltip title="Run Model" placement="right">
        <IconButton
          onClick={onRunModel}
          sx={{
            color: '#2196F3',
            mb: 2,
            bgcolor: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
            },
          }}
        >
          <PlayArrow />
        </IconButton>
      </Tooltip>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Tooltip title="Random Forest" placement="right">
          <IconButton
            onClick={() => onModelSelect('Random Forest')}
            sx={{
              color: selectedModel === 'Random Forest' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              backgroundColor: selectedModel === 'Random Forest' ? 'rgba(33, 150, 243, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Box sx={{ fontSize: '10px', fontWeight: 'bold' }}>RF</Box>
          </IconButton>
        </Tooltip>

        <Tooltip title="Isolation Forest" placement="right">
          <IconButton
            onClick={() => onModelSelect('Isolation Forest')}
            sx={{
              color: selectedModel === 'Isolation Forest' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              backgroundColor: selectedModel === 'Isolation Forest' ? 'rgba(33, 150, 243, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Box sx={{ fontSize: '10px', fontWeight: 'bold' }}>IF</Box>
          </IconButton>
        </Tooltip>
      </Box>

      <Tooltip title="Settings" placement="right">
        <IconButton
          onClick={onSettingsClick}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
            },
          }}
        >
          <Settings fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// Main Dashboard component
export default function Dashboard() {
  // State management
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [thresholds, setThresholds] = useState({
    tree_count: 100,
    sample_size: 500,
    max_tree_depth: 10,
    threshold: 0.5,
  });
  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [scatterLoading, setScatterLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New state for sidebar and visualization zoom
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [visualizationZoom, setVisualizationZoom] = useState(1.2); // Starting with a slight zoom

  // New state for instructions popup
  const [instructionsOpen, setInstructionsOpen] = useState(true);

  // API mutation hooks
  const isolationForestMutation = useIsolationForestAnalysis();
  const randomForestMutation = useRandomForestAnalysis();

  // Refs for visualization components
  const isolationForestRef = useRef<HTMLDivElement>(null);
  const randomForestRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio element on component mount
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Play completion sound
  const playCompletionSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio to start
      audioRef.current.play().catch(error => console.error('Error playing sound:', error));
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setVisualizationZoom(prev => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setVisualizationZoom(prev => Math.max(prev - 0.2, 0.8));
  };

  // Event handlers
  const handleThresholdsChange = (field: keyof typeof thresholds, value: number) => {
    setThresholds(prev => ({ ...prev, [field]: value }));
  };

  // Process results from API and update UI components
  const processResults = (modelResults: AnalysisResult) => {
    // Update scatter plot and fraud transactions data
    setAnalysisResults(modelResults);

    // Turn off loading state for scatter plot
    setScatterLoading(false);
    setIsAnalyzing(false);

    // Play completion sound
    playCompletionSound();

    // Log results for debugging
    console.log(`Analysis completed with ${selectedModel}:`, modelResults);
  };

  // Handle run model click
  const handleRunModel = () => {
    // Clear previous results and set loading states
    setIsRunning(false);  // First set to false to ensure re-rendering
    setTimeout(() => {
      setIsRunning(true);  // Then set to true to trigger visualization
      setScatterLoading(true);
      setAnalysisResults(null);
      setIsAnalyzing(true);

      // Make the appropriate API call based on the selected model
      if (selectedModel === 'Isolation Forest') {
        const params: IsolationForestParams = {
          trees: thresholds.tree_count,
          sample_size: thresholds.sample_size,
          threshold: thresholds.threshold
        };

        isolationForestMutation.mutate(params, {
          onSuccess: (data) => {
            // Process results immediately when API call returns
            processResults(data);
          },
          onError: (error) => {
            // Handle error state
            setIsAnalyzing(false);
            setScatterLoading(false);
          }
        });
      } else {
        const params: RandomForestParams = {
          n_trees: thresholds.tree_count,
          max_depth: thresholds.max_tree_depth,
          min_samples_split: thresholds.sample_size
        };

        randomForestMutation.mutate(params, {
          onSuccess: (data) => {
            // Process results immediately when API call returns
            processResults(data);
          },
          onError: (error) => {
            // Handle error state
            setIsAnalyzing(false);
            setScatterLoading(false);
          }
        });
      }
    }, 50);
  };

  // Handle model visualization completion
  const handleModelComplete = () => {
    // Just mark the visualization animation as complete
    setIsRunning(false);
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Team members data
  const teamMembers: TeamMember[] = [
    {
      name: "Cesar Valentin",
      role: "Algorithm Development",
      color: "#2196F3",
      initials: "CV",
      githubUrl: "https://github.com/XxMasterepicxX",
      linkedInUrl: "https://www.linkedin.com/in/cesar-valentin-0103a8281/"
    },
    {
      name: "Colgan Miller",
      role: "Data Analysis",
      color: "#00e676",
      initials: "CM",
      githubUrl: "https://github.com/Colganmiller",
      linkedInUrl: "https://www.linkedin.com/in/colgan-miller-0aaa082ba/"
    },
    {
      name: "Vasco Hinostroza",
      role: "Frontend Development",
      color: "#ff6b6b",
      initials: "VH",
      githubUrl: "https://github.com/theocsav",
      linkedInUrl: "https://www.linkedin.com/in/vasco-hinostroza/"
    }
  ];

  // Render component
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <CssBaseline />
      <GlobalStyles
        styles={{
          // Move @import statements to the top
          '@import': "url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap')",
          html: { scrollBehavior: 'smooth' },
          body: { margin: 0, padding: 0, backgroundColor: '#141432', overflowX: 'hidden' },
          '#root': { maxWidth: '100%', margin: 0, padding: 0 },
          '@keyframes gradientAnimation': animations.gradientAnimation,
          '@keyframes writing': animations.writing,
          '@keyframes floatAnimation': animations.floatAnimation,
          '@keyframes fadeIn': animations.fadeIn,
        }}
      />

      {/* Instructions Modal */}
      <Modal
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
        aria-labelledby="instructions-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Fade in={instructionsOpen}>
          <Paper
            elevation={4}
            sx={{
              width: '90%',
              maxWidth: '650px',
              bgcolor: 'rgba(30, 30, 60, 0.95)',
              border: '1px solid rgba(33, 150, 243, 0.4)',
              borderRadius: '16px',
              p: 4,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              outline: 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ color: '#2196F3', mr: 2, fontSize: 28 }} />
              <Typography id="instructions-modal-title" variant="h5" sx={{ color: 'white', fontWeight: 500 }}>
                Welcome to the Fraud Detection Dashboard
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}>
              Get started by following these simple steps:
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#2196F3', mb: 1, fontWeight: 500 }}>
                1. Choose a Detection Algorithm
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', ml: 2, mb: 2 }}>
                Select either Random Forest (supervised) or Isolation Forest (unsupervised) from the sidebar.
              </Typography>

              <Typography variant="subtitle1" sx={{ color: '#2196F3', mb: 1, fontWeight: 500 }}>
                2. Adjust Model Parameters (Optional)
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', ml: 2, mb: 2 }}>
                Click the settings icon to customize tree count, sample size, and other parameters.
              </Typography>

              <Typography variant="subtitle1" sx={{ color: '#2196F3', mb: 1, fontWeight: 500 }}>
                3. Run the Analysis
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', ml: 2, mb: 3 }}>
                Click "RUN MODEL" to analyze the transaction data and detect potential fraud.
              </Typography>
            </Box>

            <Box sx={{
              bgcolor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              borderRadius: '8px',
              p: 2,
              mb: 3
            }}>
              <Typography variant="h6" sx={{ color: '#2196F3', mb: 1 }}>
                Algorithm Comparison
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                <strong>Random Forest:</strong> Supervised learning model for high accuracy with labeled data
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <strong>Isolation Forest:</strong> Unsupervised learning model for anomaly detection without labels
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => setInstructionsOpen(false)}
                sx={{
                  backgroundColor: '#2196F3',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3
                }}
              >
                Got it
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>

      {/* Pill-style analyzing indicator at bottom right */}
      {isAnalyzing && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(30, 30, 60, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(187, 134, 252, 0.3)',
            borderRadius: '30px',
            px: 2,
            py: 1.2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#bb86fc',
              mr: 1.5,
              animation: 'pulse 1.5s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { opacity: 0.4, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1.2)' },
                '100%': { opacity: 0.4, transform: 'scale(0.8)' },
              },
            }}
          />
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
            Analyzing with {selectedModel}...
          </Typography>
        </Box>
      )}

      <Box>
        {/* Conditional rendering of sidebar or mini sidebar */}
        {sidebarOpen ? (
          <>
            {/* Full Sidebar with toggle button */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: drawerWidth,
              zIndex: 1300,
            }}>
              <Sidebar
                drawerWidth={drawerWidth}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                onSettingsClick={() => setThresholdsOpen(true)}
                onRunModel={handleRunModel}
              />

              {/* Add a toggle button to collapse the sidebar */}
              <IconButton
                onClick={toggleSidebar}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: '-15px',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(30, 30, 60, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  color: 'white',
                  zIndex: 1400,
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          /* Mini Sidebar when collapsed */
          <MiniSidebar
            onClick={toggleSidebar}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            onRunModel={handleRunModel}
            onSettingsClick={() => setThresholdsOpen(true)}
          />
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            p: 3,
            background: 'transparent',
            position: 'absolute',
            top: 0,
            left: sidebarOpen ? drawerWidth : '50px', // Adjust based on sidebar state
            right: 0,
            bottom: 0,
            overflowY: 'auto', // Make the main content scrollable
            width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : 'calc(100% - 50px)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'left 0.3s, width 0.3s', // Smooth transition for sidebar toggle
          }}
        >
          {/* Dashboard visualization content */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              width: '100%',
              pb: 3, // Add padding at the bottom for scrolling
            }}
          >

            {/* Two graphs side by side */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              width: '100%',
              height: { xs: 'auto', md: '500px' }, // Set fixed height on larger screens
            }}>
              {/* Visualization Box */}
              <Paper
                elevation={3}
                sx={{
                  flex: 1,
                  borderRadius: '16px',
                  background: 'rgba(30, 30, 60, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 1, // Reduced padding to maximize visualization space
                  height: { xs: '400px', md: '100%' }, // Responsive height
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(100, 100, 255, 0.4)',
                  },
                  overflow: 'hidden',
                  position: 'relative', // For zoom controls positioning
                }}
              >
                {/* Header with title and zoom controls */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  px: 1,
                }}>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 500 }}>
                    Visualization
                  </Typography>

                  {/* Zoom controls */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Zoom Out">
                      <IconButton
                        onClick={handleZoomOut}
                        size="small"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <ZoomOutIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mx: 0.5 }}>
                      {Math.round(visualizationZoom * 100)}%
                    </Typography>
                    <Tooltip title="Zoom In">
                      <IconButton
                        onClick={handleZoomIn}
                        size="small"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Visualization with zoom and drag functionality applied */}
                <Box sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  color: 'rgba(255, 255, 255, 0.7)',
                  overflow: 'hidden',
                  height: '100%',
                  width: '100%',
                  cursor: 'grab',
                  '&:active': {
                    cursor: 'grabbing',
                  }
                }}>

                  {/* Visualization content with pan/drag functionality */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      transform: `scale(${visualizationZoom})`,
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseDown={(e) => {
                      // Enable dragging only if left mouse button is pressed
                      if (e.button !== 0) return;

                      const container = e.currentTarget.parentElement;
                      if (!container) return;

                      // Get initial mouse position
                      const startX = e.clientX;
                      const startY = e.clientY;

                      // Get initial scroll position
                      const scrollLeft = container.scrollLeft;
                      const scrollTop = container.scrollTop;

                      // Handle mouse move
                      const handleMouseMove = (e: MouseEvent) => {
                        // Calculate how far the mouse has moved
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;

                        // Scroll the container
                        container.scrollLeft = scrollLeft - dx;
                        container.scrollTop = scrollTop - dy;
                      };

                      // Handle mouse up
                      const handleMouseUp = () => {
                        // Remove event listeners
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };

                      // Add event listeners for mouse move and mouse up
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    {selectedModel === 'Isolation Forest' ? (
                      <IsolationForestTree
                        ref={isolationForestRef}
                        thresholds={thresholds}
                        autoStart={isRunning}
                        onComplete={handleModelComplete}
                      />
                    ) : (
                      <RandomForestTree
                        ref={randomForestRef}
                        thresholds={thresholds}
                        autoStart={isRunning}
                        onComplete={handleModelComplete}
                      />
                    )}
                  </Box>
                </Box>
              </Paper>

              {/* Scatter Plot Box */}
              <Paper
                elevation={3}
                sx={{
                  flex: 1,
                  borderRadius: '16px',
                  background: 'rgba(30, 30, 60, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 2,
                  height: { xs: '400px', md: '100%' }, // Responsive height
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(100, 100, 255, 0.4)',
                  },
                  overflow: 'hidden',
                }}
              >
                <Typography variant="h5" sx={{ color: 'white', mb: 1.5, fontWeight: 500 }}>
                  Scatter Plot
                </Typography>
                <Box sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.7)',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ width: '100%', height: 'calc(100% - 30px)' }}>
                    <ScatterPlot
                      data={analysisResults}
                      loading={scatterLoading}
                    />
                  </Box>

                  {/* Transaction type labels below chart */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4,
                    mt: 1,
                    mb: 0.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'rgba(33, 150, 243, 0.7)',
                        border: '1px solid rgba(33, 150, 243, 1)',
                        mr: 1
                      }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Non-Fraudulent
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255, 99, 132, 0.7)',
                        border: '1px solid rgba(255, 99, 132, 1)',
                        mr: 1
                      }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Fraudulent
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* NEW: Transaction Timeline component */}
            {(analysisResults || isAnalyzing) && (
              <TransactionTimeline
                data={analysisResults}
                isLoading={isAnalyzing}
              />
            )}

            {/* Results section with tabs */}
            {(analysisResults || isAnalyzing) && (
              <Paper
                elevation={3}
                sx={{
                  width: '100%',
                  borderRadius: '16px',
                  background: 'rgba(30, 30, 60, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'box-shadow 0.2s ease-in-out',
                  overflow: 'hidden',
                  minHeight: '400px',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(100, 100, 255, 0.4)',
                  }
                }}
              >
                {/* Tab navigation */}
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Results tabs"
                    variant="fullWidth"
                    sx={{
                      minHeight: '48px',
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#2196F3',
                      },
                      '& .MuiTab-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        minHeight: '48px',
                        '&.Mui-selected': {
                          color: '#fff',
                        },
                      },
                    }}
                  >
                    <Tab
                      icon={<StorageIcon sx={{ fontSize: 20 }} />}
                      iconPosition="start"
                      label="Fraud Transactions"
                      sx={{ minHeight: '48px' }}
                    />
                    <Tab
                      icon={<AssessmentIcon sx={{ fontSize: 20 }} />}
                      iconPosition="start"
                      label="Model Metrics"
                      sx={{ minHeight: '48px' }}
                    />
                    <Tab
                      icon={<TableChartIcon sx={{ fontSize: 20 }} />}
                      iconPosition="start"
                      label="Confusion Matrix"
                      sx={{ minHeight: '48px' }}
                    />
                  </Tabs>
                </Box>

                {/* Tab content */}
                <Box sx={{ p: 3 }}>
                  {/* Fraud Transactions Tab */}
                  {tabValue === 0 && (
                    <TransactionsPanel
                      data={analysisResults}
                      isLoading={isAnalyzing}
                    />
                  )}

                  {/* Model Metrics Tab */}
                  {tabValue === 1 && (
                    <MetricsPanel
                      data={analysisResults}
                      isLoading={isAnalyzing}
                      selectedModel={selectedModel}
                      thresholds={thresholds}
                    />
                  )}

                  {/* Confusion Matrix Tab */}
                  {tabValue === 2 && (
                    <ConfusionMatrixPanel
                      data={analysisResults}
                      isLoading={isAnalyzing}
                    />
                  )}
                </Box>
              </Paper>
            )}

            {/* Results placeholder when no analysis has been run */}
            {!analysisResults && !isAnalyzing && (
              <Paper
                elevation={3}
                sx={{
                  width: '100%',
                  borderRadius: '16px',
                  background: 'rgba(30, 30, 60, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'box-shadow 0.2s ease-in-out',
                  minHeight: '400px',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(100, 100, 255, 0.4)',
                  }
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  maxWidth: '600px'
                }}>
                  <AssessmentIcon sx={{ fontSize: 60, color: 'rgba(33, 150, 243, 0.7)', mb: 3 }} />
                  <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
                    Results Will Appear Here
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>

          <ModelSettingsDialog
            open={thresholdsOpen}
            onClose={() => setThresholdsOpen(false)}
            thresholds={thresholds}
            handleThresholdsChange={handleThresholdsChange}
            selectedModel={selectedModel}
            onRunModel={handleRunModel}
            currentMetrics={analysisResults ? {
              accuracy: analysisResults.accuracy,
              precision: analysisResults.precision,
              recall: analysisResults.recall,
              f1_score: analysisResults.f1_score,
              falsePositiveRate: analysisResults.confusion_matrix ?
                analysisResults.confusion_matrix.false_positives /
                (analysisResults.confusion_matrix.false_positives + analysisResults.confusion_matrix.true_negatives) :
                undefined,
              falseNegativeRate: analysisResults.confusion_matrix ?
                analysisResults.confusion_matrix.false_negatives /
                (analysisResults.confusion_matrix.false_negatives + analysisResults.confusion_matrix.true_positives) :
                undefined,
              fraudCount: analysisResults.fraud_count || (analysisResults.fraud_transactions?.length || 0)
            } : undefined}
          />

          {/* Header Action Icons - Enhanced with Team Credits */}
          <Box
            sx={{
              position: 'fixed',
              top: 18,
              right: 20,
              display: 'flex',
              gap: 2,
              zIndex: 1500,
              alignItems: 'center',
              height: 40,
              backgroundColor: 'rgba(30, 30, 60, 0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: '30px',
              padding: '0 16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="body2" sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' }
            }}>
              Fraud Detection System v1.0
            </Typography>
            <Divider orientation="vertical" flexItem sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: { xs: 'none', sm: 'block' }
            }} />
            <Tooltip title="Team Credits">
              <IconButton
                onClick={() => setTeamDialogOpen(true)}
                sx={{
                  color: "#2196F3",
                  '&:hover': {
                    backgroundColor: "rgba(33, 150, 243, 0.2)"
                  }
                }}
              >
                <GroupIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Instructions">
              <IconButton
                onClick={() => setInstructionsOpen(true)}
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  '&:hover': {
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }
                }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Return to Homepage">
              <IconButton
                onClick={() => window.location.href = '/'}
                sx={{
                  color: "rgba(255, 107, 107, 0.9)",
                  '&:hover': {
                    backgroundColor: "rgba(255, 107, 107, 0.2)"
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Team Dialog Component */}
          <TeamDialog
            open={teamDialogOpen}
            onClose={() => setTeamDialogOpen(false)}
            teamMembers={teamMembers}
          />
        </Box>
      </Box>
    </>
  );
}