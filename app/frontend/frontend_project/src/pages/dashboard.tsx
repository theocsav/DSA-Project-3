import React, { useState } from 'react';
import { Box, CssBaseline, GlobalStyles, IconButton, Tooltip } from '@mui/material';

// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';

// Import our custom components
import Sidebar from '../components/dashboard/Sidebar';
import StatusBar from '../components/dashboard/StatusBar';
import ModelSettingsDialog from '../components/dashboard/ModelSettingsDialog';
import TeamDialog from '../components/dashboard/TeamDialog';
import { TeamMember } from '../components/TeamMemberCard';
import { commonStyles, animations } from '../styles/common';

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

  // Stats for the status bar
  const stats = {
    fraudPercentage: '7%',
    analyzedCount: '100,000',
    accuracy: '98%',
    time: '10s',
  };

  // Event handlers
  const handleThresholdsChange = (field, value) => {
    setThresholds((prev) => ({ ...prev, [field]: value }));
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
        />

        {/* Status Bar Component */}
        <StatusBar stats={stats} />

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            background: 'transparent',
            position: 'relative',
            overflow: 'hidden',
            ml: `${drawerWidth}px`,
          }}
        >
          {/* Visualization placeholder */}
          <Box
            sx={{
              height: 'calc(100vh - 64px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Your visualization content will go here */}
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
              position: 'fixed',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1,
              zIndex: 1100,
            }}
          >
            {[
              { title: "Team Credits", icon: <GroupIcon />, onClick: () => setTeamDialogOpen(true), hoverColor: "rgba(33, 150, 243, 0.2)" },
              { title: "Exit", icon: <CloseIcon />, onClick: () => window.location.href = '/', hoverColor: "rgba(255, 107, 107, 0.2)" }
            ].map((action) => (
              <Tooltip key={action.title} title={action.title}>
                <IconButton
                  onClick={action.onClick}
                  sx={{
                    backgroundColor: 'rgba(26, 26, 64, 0.8)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: action.hoverColor,
                    },
                  }}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
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
