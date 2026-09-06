import React from 'react';
import { Dialog, DialogContent, Box, Typography, Grid } from '@mui/material';
import TeamMemberCard, { TeamMember } from '../TeamMemberCard';

interface TeamDialogProps {
  open: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
}

const TeamDialog: React.FC<TeamDialogProps> = ({ open, onClose, teamMembers }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            maxWidth: '1300px',
            mx: 'auto'
          }}>
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.name}
                {...member}
                variant="dashboard"
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
            onClick={onClose}
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
  );
};

export default TeamDialog;