import React, { useState, useRef, useEffect } from 'react';
import { Box, CssBaseline, GlobalStyles, IconButton, Tooltip, Typography, Paper, Grid } from '@mui/material';

// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';

// Import our custom components
import Sidebar from '../components/dashboard/Sidebar';
import ModelSettingsDialog from '../components/dashboard/ModelSettingsDialog';
import TeamDialog from '../components/dashboard/TeamDialog';
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

  // API mutation hooks
  const isolationForestMutation = useIsolationForestAnalysis();
  const randomForestMutation = useRandomForestAnalysis();

  // Stats for the status bar
  const [stats, setStats] = useState({
    fraudPercentage: '7%',
    analyzedCount: '100,000',
    accuracy: '98%',
    time: '10s',
  });

  // Refs for visualization components
  const isolationForestRef = useRef<HTMLDivElement>(null);
  const randomForestRef = useRef<HTMLDivElement>(null);

  // Event handlers
  interface Thresholds {
    tree_count: number;
    sample_size: number;
    max_tree_depth: number;
    threshold: number;
  }

  const handleThresholdsChange = (field: keyof Thresholds, value: number) => {
    setThresholds((prev: Thresholds) => ({ ...prev, [field]: value }));
  };

  // Process results from API and update UI components
  const processResults = (modelResults: AnalysisResult) => {
    // Extract key metrics
    const fraudCount = modelResults.confusion_matrix?.true_positives || 0;
    const totalCount = modelResults.data_points || 100000;
    
    // Use fraud_percentage from API if available, otherwise calculate it
    const fraudPercentage = modelResults.fraud_percentage || 
                           (fraudCount / totalCount * 100) || 
                           (modelResults.fraud_count / totalCount * 100);
    
    // Update status bar with real-time values
    setStats({
      fraudPercentage: `${fraudPercentage.toFixed(1)}%`,
      analyzedCount: `${totalCount.toLocaleString()}`,
      accuracy: `${(modelResults.accuracy * 100).toFixed(1)}%`,
      time: `${modelResults.execution_time.toFixed(1)}s`,
    });

    // Update scatter plot and fraud transactions data
    setAnalysisResults(modelResults);
    
    // Turn off loading state for scatter plot
    setScatterLoading(false);
    
    // Log results for debugging
    console.log(`Analysis completed with ${selectedModel}:`, modelResults);
  };

  // Handle run model click
  const handleRunModel = () => {
    // Clear previous results and set loading states
    setIsRunning(true);
    setScatterLoading(true);
    setAnalysisResults(null);
    
    // Display loading message in stats
    setStats(prevStats => ({
      ...prevStats,
      time: 'Loading...'
    }));

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
        }
      });
    }
  };

  // Handle model visualization completion
  const handleModelComplete = () => {
    // Just mark the visualization animation as complete
    setIsRunning(false);
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
          html: { overflow: 'hidden' },
          body: { overflow: 'hidden', margin: 0, padding: 0, backgroundColor: commonStyles.colors.background },
          '@keyframes gradientAnimation': animations.gradientAnimation,
          '@keyframes writing': animations.writing,
          '@keyframes floatAnimation': animations.floatAnimation,
          '@keyframes fadeIn': animations.fadeIn,
          '@import': "url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap')",
        }}
      />

      <Box>
        {/* Sidebar Component */}
        <Sidebar 
          drawerWidth={drawerWidth} 
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          onSettingsClick={() => setThresholdsOpen(true)}
          onRunModel={handleRunModel}
        />

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            background: 'transparent',
            position: 'absolute',
            top: 0,
            left: drawerWidth,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            width: `calc(100% - ${drawerWidth}px)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Stats as pills at top left */}
          <Box 
            sx={{
              position: 'absolute',
              top: 18,
              left: 24,
              display: 'flex',
              gap: 2,
              zIndex: 1100,
              alignItems: 'center',
              height: 40,
            }}
          >
            {[
              { label: "Fraud Rate", value: stats.fraudPercentage, color: "#ff6b6b", bgColor: "rgba(255, 107, 107, 0.15)" },
              { label: "Analyzed", value: stats.analyzedCount, color: "#00e676", bgColor: "rgba(0, 230, 118, 0.15)" },
              { label: "Accuracy", value: stats.accuracy, color: "#2196F3", bgColor: "rgba(33, 150, 243, 0.15)" },
              { label: "Time", value: stats.time, color: "#bb86fc", bgColor: "rgba(187, 134, 252, 0.15)" }
            ].map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '20px',
                  px: 2,
                  py: 0.75,
                  height: 40,
                  backgroundColor: stat.bgColor,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${stat.color}30`,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: 1 }}>
                  {stat.label}:
                </Typography>
                <Typography variant="body2" sx={{ color: stat.color, fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Dashboard visualization content */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2, // No gap between components - removed spacing
              width: '100%',
              height: '100%', 
              maxHeight: 'calc(100vh - 80px)', // Fill available height minus stats padding
              mt: '65px', // Adjusted to position below stats pills
              mb: '5px',
            }}
          >
            {/* Two graphs side by side */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3, // Minimal gap between side-by-side boxes
              width: '100%',
              height: '66%', // Proportional height for top section
              minHeight: '0', // Allow flexible sizing
            }}>
              {/* Visualization Box */}
              <Paper 
                elevation={3} 
                sx={{
                  flex: 1,
                  borderRadius: '16px',
                  background: 'rgba(30, 30, 60, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 2,
                  height: '100%', // Fill available height
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
                  Visualization
                </Typography>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  color: 'rgba(255, 255, 255, 0.7)',
                  overflow: 'hidden' // Prevent content overflow
                }}>
                  {/* Conditionally render the appropriate visualization */}
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
                  height: '100%', // Fill available height
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
                  overflow: 'hidden' // Prevent content overflow
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
            
            {/* Scrollable text box */}
            <Paper 
              elevation={3} 
              sx={{
                width: '100%',
                borderRadius: '16px',
                background: 'rgba(30, 30, 60, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                p: 2,
                height: '34%', // Increased to fill remaining space
                mt: 1, // Very minimal top margin
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
                transition: 'box-shadow 0.2s ease-in-out',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(100, 100, 255, 0.4)',
                }
              }}
            >
              <Typography variant="h5" sx={{ color: 'white', mb: 1.5, fontWeight: 500 }}>
                Fraud Transactions
              </Typography>
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                color: 'rgba(255, 255, 255, 0.7)',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                  },
                },
              }}>
                {analysisResults ? (
                  <Box>
                    {/* Display detected fraud transactions if available */}
                    {analysisResults.fraud_transactions && analysisResults.fraud_transactions.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                        {analysisResults.fraud_transactions.slice(0, 20).map((transaction: any, index: number) => (
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
                        {analysisResults.fraud_transactions.length > 20 && (
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 1 }}>
                            Showing 20 of {analysisResults.fraud_transactions.length} fraud transactions
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        No fraud transactions detected.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" component="div" sx={{ p: 1 }}>
                    Transaction details will appear here after analysis is complete
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
          
          {/* Model Settings Dialog Component */}
          <ModelSettingsDialog 
            open={thresholdsOpen}
            onClose={() => setThresholdsOpen(false)}
            thresholds={thresholds}
            handleThresholdsChange={handleThresholdsChange}
          />

          {/* Header Action Icons */}
          <Box
            sx={{
              position: 'absolute',
              top: 18,
              right: 20,
              display: 'flex',
              gap: 2,
              zIndex: 1100,
              alignItems: 'center',
              height: 40,
            }}
          >
            {[
              { title: "Team Credits", icon: <GroupIcon />, onClick: () => setTeamDialogOpen(true), hoverColor: "rgba(33, 150, 243, 0.2)", color: "#2196F3" },
              { title: "Exit", icon: <CloseIcon />, onClick: () => window.location.href = '/', hoverColor: "rgba(255, 107, 107, 0.2)", color: "#ff6b6b" }
            ].map((action) => (
              <Box
                key={action.title}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '20px',
                  backgroundColor: `${action.color}15`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${action.color}30`,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease',
                  height: 40,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <Tooltip title={action.title}>
                  <IconButton
                    onClick={action.onClick}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
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