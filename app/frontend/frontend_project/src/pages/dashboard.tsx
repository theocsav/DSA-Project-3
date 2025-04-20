import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';

// Constants
const drawerWidth = 240;

// Style objects for reuse
const styles = {
  glassPanel: {
    background: 'rgba(26, 26, 64, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
  },
  buttonHover: {
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
    }
  }
};

// Component for team member card
const TeamMemberCard = ({ name, role, color, initials, githubUrl, linkedInUrl }) => (
  <Grid item sx={{ width: 'calc(100% / 3 - 16px)', maxWidth: '380px' }}>
    <Paper
      elevation={4}
      sx={{
        p: 3,
        color: 'white',
        height: '100%',
        minHeight: '320px', // Reduced from 360px since we need less space now
        minWidth: '250px',
        width: '100%',
        ...styles.glassPanel,
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': {
          background: 'rgba(33, 33, 75, 0.95)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.3)',
        }
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            margin: '0 auto', 
            bgcolor: color,
            mb: 2,
            fontSize: '1.8rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
          }}
        >
          {initials}
        </Avatar>
        <Typography variant="h5" sx={{ mb: 1 }}>
          {name}
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {role}
        </Typography>
      </Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 3 // Space between icons
      }}>
        {/* GitHub Icon */}
        <IconButton
          aria-label="GitHub Profile"
          href={githubUrl}
          target="_blank"
          sx={{
            color: '#2196F3',
            border: '1.5px solid rgba(33, 150, 243, 0.5)',
            borderRadius: '50%',
            padding: '8px',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.12)',
              borderColor: '#2196F3',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </IconButton>
        
        {/* LinkedIn Icon */}
        <IconButton
          aria-label="LinkedIn Profile"
          href={linkedInUrl}
          target="_blank"
          sx={{
            color: '#2196F3',
            border: '1.5px solid rgba(33, 150, 243, 0.5)',
            borderRadius: '50%',
            padding: '8px',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.12)',
              borderColor: '#2196F3',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </IconButton>
      </Box>
    </Paper>
  </Grid>
);

// Component for status indicator
const StatusIndicator = ({ label, value, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>{label}</Typography>
    <Typography variant="body1" sx={{ fontWeight: 600, color }}>{value}</Typography>
  </Box>
);

// Main component
export default function Dashboard() {
  // State management
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [thresholds, setThresholds] = useState({
    tree_count: 100,
    sample_size: 500,
    max_tree_depth: 10,
    threshold: 0.5,
  });
  const [selectedModel, setSelectedModel] = useState('');
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
  const teamMembers = [
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
      linkedInUrl: "https://www.linkedin.com/in/colgan-miller/"
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
          body: { overflow: 'hidden', margin: 0, padding: 0, backgroundColor: '#141432' },
          '@keyframes gradientAnimation': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          '@keyframes writing': {
            '0%': { opacity: 0, transform: 'translateY(5px) rotate(-1deg)' },
            '100%': { opacity: 1, transform: 'translateY(0) rotate(-1deg)' },
          },
          '@import': "url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap')",
        }}
      />

      <Box>
        {/* Sidebar/Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              ...styles.glassPanel,
              borderRadius: 0,
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              color: 'white',
            },
          }}
        >
          {/* App Title */}
          <Toolbar sx={{ display: 'flex', justifyContent: 'center', padding: '20px 0', flexDirection: 'column' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 400,
                fontSize: '0.7rem',
                letterSpacing: '0.3em',
                color: '#2196F3',
                textTransform: 'uppercase',
                mb: -0.5,
              }}
            >
              INTELLIGENT
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: "'Caveat', cursive",
                fontWeight: 700,
                fontSize: '1.6rem',
                letterSpacing: 1,
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transform: 'rotate(-1deg)',
                animation: 'writing 1.5s ease-in-out',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  bottom: '-2px',
                  left: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.7) 20%, rgba(33, 150, 243, 0.7) 80%, transparent)',
                  transform: 'scaleX(0.9)',
                }
              }}
            >
              Fraud Detection
            </Typography>
          </Toolbar>
          
          {/* Run Button */}
          <List sx={{ mt: 1 }}>
            <ListItem disablePadding>
              <ListItemButton 
                aria-label="Run"
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  borderRadius: '8px',
                  margin: '0 16px',
                  color: 'white',
                  fontWeight: 'bold',
                  ...styles.buttonHover,
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.5)',
                    transform: 'translateY(-2px)'
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  <PlayArrowIcon />
                </ListItemIcon>
                <ListItemText primary="RUN MODEL" sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }} />
              </ListItemButton>
            </ListItem>
          </List>
          
          {/* Model Selection */}
          <List
            subheader={
              <ListSubheader 
                component="div" 
                disableSticky
                sx={{ 
                  backgroundColor: 'transparent', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  padding: '0 24px',
                }}
              >
                DETECTION MODEL
              </ListSubheader>
            }
          >
            {['Random Forest', 'Isolation Forest'].map((model) => (
              <ListItem key={model} disablePadding>
                <ListItemButton
                  aria-label={`Select ${model}`}
                  selected={selectedModel === model}
                  onClick={() => setSelectedModel(model)}
                  sx={{
                    margin: '4px 8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(33, 150, 243, 0.15)',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.25)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: selectedModel === model ? '#2196F3' : 'rgba(255, 255, 255, 0.7)' }}>
                    <ChevronRightIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={model} 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontWeight: selectedModel === model ? 600 : 400,
                        color: selectedModel === model ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                      } 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          {/* Hyperparameters */}
          <List
            subheader={
              <ListSubheader 
                component="div" 
                disableSticky
                sx={{ 
                  backgroundColor: 'transparent', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  padding: '0 24px',
                }}
              >
                HYPERPARAMETERS
              </ListSubheader>
            }
          >
            <ListItem disablePadding>
              <ListItemButton
                aria-label="Model Settings"
                onClick={() => setThresholdsOpen(true)}
                sx={{
                  margin: '4px 8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Model Settings" 
                  sx={{ '& .MuiListItemText-primary': { color: 'rgba(255, 255, 255, 0.7)' } }} 
                />
              </ListItemButton>
            </ListItem>
          </List>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Bottom Actions */}
          <List>
            {[
              { label: 'Export Results', icon: <DownloadIcon /> },
              { label: 'Upload Data', icon: <UploadIcon /> }
            ].map((item, index) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton 
                  aria-label={item.label}
                  sx={{
                    margin: index === 1 ? '4px 8px 16px 8px' : '4px 8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ '& .MuiListItemText-primary': { color: 'rgba(255, 255, 255, 0.7)' } }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Status Bar */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: 'auto',
            minWidth: '500px',
            height: '52px',
            ...styles.glassPanel,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            px: 3,
            borderRadius: '26px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
            zIndex: 100,
          }}
        >
          <StatusIndicator label="Analyzed" value={stats.analyzedCount} color="#2196F3" />
          <StatusIndicator label="Time" value={stats.time} color="#2196F3" />
          <StatusIndicator label="Accuracy" value={stats.accuracy} color="#00e676" />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            borderRadius: '16px',
            px: 2,
            py: 0.5,
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 107, 107, 0.8)' }}>Fraud</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#ff6b6b' }}>{stats.fraudPercentage}</Typography>
          </Box>
        </Box>

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            background: 'transparent',
            position: 'relative',
            overflow: 'hidden',
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
          
          {/* Thresholds Dialog */}
          <Dialog 
            open={thresholdsOpen} 
            onClose={() => setThresholdsOpen(false)}
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
              
              {['tree_count', 'sample_size', 'max_tree_depth', 'threshold'].map((field) => (
                <Box key={field} sx={{ position: 'relative', mb: 3.5 }}> {/* Increased from 2.5 to 3.5 */}
                  <TextField
                    fullWidth
                    label={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    type="number"
                    value={thresholds[field]}
                    onChange={(e) => handleThresholdsChange(field, e.target.value)}
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
                      bottom: '-12px', // Increased from -5px to add more space
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
              pt: 1, // Changed from pt: 0 to pt: 1
              mt: -5, // Added negative margin to move up
            }}>
              <Button 
                onClick={() => setThresholdsOpen(false)}
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
                onClick={() => setThresholdsOpen(false)}
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

          {/* Team Credits Dialog */}
          <Dialog
            open={teamDialogOpen}
            onClose={() => setTeamDialogOpen(false)}
            BackdropProps={{
              sx: { backdropFilter: 'blur(3px)' }
            }}
            PaperProps={{
              sx: {
                background: 'transparent',
                boxShadow: 'none',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '1200px',
                overflow: 'hidden',
                pt: 3,
                position: 'relative',
              }
            }}
          >
            <DialogContent sx={{ py: 3, px: 3, background: 'transparent', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', alignItems: 'center' }}> 
                <Grid container spacing={3} justifyContent="center" sx={{ 
                  maxWidth: '1300px', /* Increased from 1100px to accommodate wider cards */
                  mx: 'auto'
                }}>
                  {teamMembers.map((member) => (
                    <TeamMemberCard
                      key={member.name}
                      name={member.name}
                      role={member.role}
                      color={member.color}
                      initials={member.initials}
                      githubUrl={member.githubUrl}
                      linkedInUrl={member.linkedInUrl}
                    />
                  ))}
                </Grid>
                
                {/* Close text */}
                <Box 
                  sx={{ 
                    mt: 4, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      textShadow: '0 2px 8px rgba(255,255,255,0.5)'
                    }
                  }} 
                  onClick={() => setTeamDialogOpen(false)}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      letterSpacing: '1px',
                      fontWeight: 500,
                      paddingBottom: '2px',
                      '&:hover': { 
                        color: 'rgba(255, 255, 255, 0.9)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.4)' 
                      }
                    }}
                  >
                    CLOSE
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    </>
  );
}
