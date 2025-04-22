import React, { useState, useRef, useEffect } from 'react';
import { Box, CssBaseline, GlobalStyles, IconButton, Tooltip, Typography, Paper } from '@mui/material';

// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';

// Import our custom components
import Sidebar from '../components/dashboard/Sidebar';
import ModelSettingsDialog from '../components/dashboard/ModelSettingsDialog';
import TeamDialog from '../components/dashboard/TeamDialog';
import { TeamMember } from '../components/TeamMemberCard';
import { commonStyles, animations } from '../styles/common';
import { AnalysisResult } from '../api/types';

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

  // Handle run model click
  const handleRunModel = () => {
    setIsRunning(true);
    setScatterLoading(true);
    setAnalysisResults(null);
  };

  // Handle model completion
  const handleModelComplete = (modelResults: any) => {
    setIsRunning(false);
    setScatterLoading(false);
    
    // Update analysis results for scatter plot
    setAnalysisResults(modelResults);
    
    // Update stats from model results
    if (modelResults) {
      setStats({
        fraudPercentage: `${Math.round(modelResults.fraud_percentage || 7)}%`,
        analyzedCount: `${modelResults.data_points?.toLocaleString() || '100,000'}`,
        accuracy: `${Math.round(modelResults.accuracy * 100)}%`,
        time: `${modelResults.execution_time.toFixed(1)}s`,
      });
    }
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
              gap: 3,
              width: '100%',
              height: '100%',
              maxHeight: '95vh',
              mt: '60px',
              mb: '10px',
            }}
          >
            {/* Two graphs side by side */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              width: '100%',
              height: '90%',
            }}>
              {/* Visualization Box */}
              <Paper 
                elevation={3} 
                sx={{
                  flex: 1,
                  borderRadius: '16px',
                  background: 'rgba(30, 30, 60, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(100, 100, 255, 0.4)',
                  },
                  overflow: 'hidden' // Ensure content doesn't overflow
                }}
              >
                <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
                  Visualization
                </Typography>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  color: 'rgba(255, 255, 255, 0.7)'
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
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(100, 100, 255, 0.4)',
                  }
                }}
              >
                <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
                  Scatter Plot
                </Typography>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  <ScatterPlot 
                    data={analysisResults} 
                    loading={scatterLoading}
                  />
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
                p: 3,
                height: '35%',
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
              <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
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
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Analysis completed with {selectedModel}. 
                      Detected {analysisResults.confusion_matrix?.true_positives || 0} fraudulent transactions 
                      out of {analysisResults.data_points || 0} total transactions.
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      <strong>Model Performance:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <Typography variant="caption">Accuracy: {(analysisResults.accuracy * 100).toFixed(1)}%</Typography>
                      </Box>
                      <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <Typography variant="caption">Precision: {(analysisResults.precision * 100).toFixed(1)}%</Typography>
                      </Box>
                      <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <Typography variant="caption">Recall: {(analysisResults.recall * 100).toFixed(1)}%</Typography>
                      </Box>
                      <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <Typography variant="caption">F1 Score: {(analysisResults.f1_score * 100).toFixed(1)}%</Typography>
                      </Box>
                    </Box>
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