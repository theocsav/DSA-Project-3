import React from 'react';
import { Box, Paper, Typography, Avatar, IconButton } from '@mui/material';
import { commonStyles } from '../styles/common';

export interface TeamMember {
  name: string;
  role: string;
  color: string;
  initials: string;
  githubUrl: string;
  linkedInUrl: string;
}

interface TeamMemberCardProps extends TeamMember {
  variant?: 'homepage' | 'dashboard';
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  role,
  color,
  initials,
  githubUrl,
  linkedInUrl,
  variant = 'homepage'
}) => {
  // Different styles based on where the component is being used
  const containerStyle = variant === 'dashboard' 
    ? { width: 'calc(100% / 3 - 16px)', maxWidth: '380px' }
    : {};
  
  const cardStyle = variant === 'dashboard'
    ? {
        p: 3,
        color: 'white',
        height: '100%',
        minHeight: '320px',
        minWidth: '250px',
        width: '100%',
      }
    : {
        p: 3,
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        width: '300px',
        color: 'white',
      };

  return (
    <Box sx={containerStyle}>
      <Paper 
        elevation={4} 
        sx={{ 
          ...commonStyles.glassPanel,
          ...cardStyle,
          transition: 'all 0.3s',
          '&:hover': {
            background: 'rgba(33, 33, 75, 0.95)', 
            transform: 'translateY(-4px)', 
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar sx={{ 
            bgcolor: color, 
            width: 80, 
            height: 80, 
            margin: '0 auto', 
            mb: 2, 
            fontSize: '1.8rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
          }}>
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
          gap: 3, 
          mt: variant === 'homepage' ? 2 : 0
        }}>
          {/* GitHub Icon */}
          <IconButton
            aria-label="GitHub Profile" 
            href={githubUrl} 
            target="_blank" 
            sx={{ 
              color: commonStyles.colors.primary, 
              border: '1.5px solid rgba(33, 150, 243, 0.5)', 
              p: 1,
              borderRadius: '50%',
              padding: '8px',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.12)', 
                borderColor: commonStyles.colors.primary,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              } 
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </IconButton>
          
          {/* LinkedIn Icon */}
          <IconButton 
            aria-label="LinkedIn Profile" 
            href={linkedInUrl} 
            target="_blank" 
            sx={{ 
              color: commonStyles.colors.primary, 
              border: '1.5px solid rgba(33, 150, 243, 0.5)', 
              p: 1,
              borderRadius: '50%',
              padding: '8px',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.12)', 
                borderColor: commonStyles.colors.primary,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              } 
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeamMemberCard;