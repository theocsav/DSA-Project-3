import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { commonStyles } from '../styles/common';

interface SectionContainerProps {
  children: ReactNode;
  id?: string;
  background: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  py?: number;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ 
  children, 
  id, 
  background,
  position = 'static',
  py = 10
}) => (
  <Box 
    id={id} 
    sx={{ 
      ...commonStyles.section,
      py,
      background,
      position,
      display: 'flex', 
      justifyContent: 'center' 
    }}
  >
    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
      {children}
    </Container>
  </Box>
);

export default SectionContainer;