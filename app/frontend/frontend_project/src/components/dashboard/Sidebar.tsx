import React from 'react';
import {
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Box
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { commonStyles } from '../../styles/common';

interface SidebarProps {
  drawerWidth: number;
  selectedModel: string;
  onModelSelect: (model: string) => void;
  onSettingsClick: () => void;
  onRunModel?: () => void; // Added prop for run model action
}

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  selectedModel,
  onModelSelect,
  onSettingsClick,
  onRunModel
}) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          ...commonStyles.glassPanel,
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
            color: commonStyles.colors.primary,
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
            onClick={onRunModel} // Use the new onRunModel prop
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              borderRadius: '8px',
              margin: '0 16px',
              color: 'white',
              fontWeight: 'bold',
              ...commonStyles.buttonHover,
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
              onClick={() => onModelSelect(model)}
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
              <ListItemIcon sx={{ color: selectedModel === model ? commonStyles.colors.primary : 'rgba(255, 255, 255, 0.7)' }}>
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
            onClick={onSettingsClick}
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
  );
};

export default Sidebar;