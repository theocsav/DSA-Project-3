import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import { commonStyles, animations } from '../../styles/common';

interface HeroSectionProps {
  scrollToSection: (id: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollToSection }) => {
  useEffect(() => {
    const particlesContainer = document.getElementById('particles-js');
    
    if (particlesContainer) {
      const createParticle = () => {
        const size = Math.random() * 5 + 1;
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.4 + 0.1})`;
        particle.style.borderRadius = '50%';
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.boxShadow = '0 0 10px rgba(33, 150, 243, 0.5)';
        particle.style.animation = `float ${Math.random() * 15 + 5}s linear infinite`;
        particle.style.opacity = '0';
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
          particle.style.opacity = (Math.random() * 0.5 + 0.2).toString();
          
          // Start moving particle
          const angle = Math.random() * 360;
          const distance = Math.random() * 100 + 50;
          const duration = Math.random() * 20 + 10;
          
          particle.animate([
            { transform: 'translate(0, 0)' },
            { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)` }
          ], {
            duration: duration * 1000,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in-out'
          });
        }, 100);
        
        // Remove particle after some time to prevent memory issues
        setTimeout(() => {
          if (particlesContainer.contains(particle)) {
            particlesContainer.removeChild(particle);
          }
        }, 60000);
      };
      
      // Create initial batch of particles
      for (let i = 0; i < 40; i++) {
        createParticle();
      }
      
      // Add new particles occasionally
      const interval = setInterval(() => {
        if (document.getElementById('particles-js')) {
          createParticle();
        } else {
          clearInterval(interval);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #141432 0%, #1a1a40 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        id="particles-js"
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />
      
      {/* Animated background gradients */}
      <Box
        sx={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 30%, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0) 25%)',
          animation: 'pulse 15s ease-in-out infinite alternate',
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 80% 70%, rgba(0, 230, 118, 0.1) 0%, rgba(0, 230, 118, 0) 25%)',
          animation: 'pulse 20s ease-in-out infinite alternate-reverse',
          zIndex: 0,
        }}
      />
      
      {/* 3D perspective container */}
      <Container maxWidth="lg" sx={{ 
        position: 'relative',
        zIndex: 2,
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        textAlign: 'center',
        perspective: '1000px',
      }}>
        {/* Feature highlights */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            position: 'absolute',
            top: '-80px',
            width: '100%',
            justifyContent: 'center',
            gap: 5,
            opacity: 0.9,
          }}
        >
          {[
            { icon: '🔍', title: 'Smart Detection', color: '#2196F3' },
            { icon: '📊', title: 'Real-time Analytics', color: '#00e676' },
            { icon: '🛡️', title: 'Secure Protection', color: '#ff6b6b' }
          ].map((feature, index) => (
            <Box 
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(20, 20, 50, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                py: 0.5,
                px: 2,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                animation: `fadeIn 0.5s ease-out ${0.2 * index}s both`,
              }}
            >
              <Box sx={{ mr: 1, fontSize: '1.2rem' }}>{feature.icon}</Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'white', fontSize: '0.85rem' }}>
                {feature.title}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 800,
            color: '#fff',
            textShadow: '0 5px 15px rgba(0,0,0,0.5)',
            animation: 'fadeIn 1s ease-out',
            mb: 1,
            fontSize: { xs: '2.8rem', md: '4.5rem' },
            letterSpacing: '-1px',
            position: 'relative',
            zIndex: 3,
            '&::before': {
              content: '"INTELLIGENT"',
              position: 'absolute',
              top: '-2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: { xs: '1rem', md: '1.5rem' },
              fontWeight: 400,
              letterSpacing: '0.5em',
              color: '#2196F3',
              textTransform: 'uppercase',
            }
          }}
        >
          FRAUD DETECTION
        </Typography>

        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          textAlign: 'center',
          mt: 2, 
          mb: 5,
          '&::after': {
            content: '""',
            position: 'absolute',
            width: { xs: '80%', md: '50%' },
            height: '1px',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.7), transparent)',
          }
        }}>
          <Typography
            variant="h5"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              textAlign: 'center', 
              maxWidth: '800px', 
              mx: 'auto',
              px: 3, 
              animation: 'fadeIn 1s ease-out 0.3s both', 
              fontWeight: 300 
            }}
          >
            State-of-the-art machine learning algorithms to protect your transactions
            and minimize financial risk
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2, 
          mt: 4,
          animation: 'fadeIn 1s ease-out 0.6s both',
        }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            component={Link}
            to="/dashboard"
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 5px 15px rgba(33, 203, 243, 0.3)',
              borderRadius: '30px',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              transition: 'all 0.3s',
              '&:hover': { 
                transform: 'translateY(-3px)', 
                boxShadow: '0 8px 20px rgba(33, 203, 243, 0.5)'
              }
            }}
          >
            Explore Dashboard
          </Button>
          
          <Button
            variant="outlined"
            component="a"
            href="#algorithms"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('algorithms');
            }}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              borderRadius: '30px',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              color: '#fff',
              transition: 'all 0.3s',
              '&:hover': { 
                background: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.5)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            Learn More
          </Button>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 5, 
          gap: 4,
          animation: 'fadeIn 1s ease-out 0.9s both',
        }} />
      </Container>

      <IconButton
        aria-label="Scroll down"
        onClick={() => scrollToSection('algorithms')}
        sx={{ 
          position: 'absolute', 
          bottom: 40, 
          zIndex: 10,
          color: 'rgba(255, 255, 255, 0.7)', 
          animation: 'floatAnimation 2s ease-in-out infinite', 
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } 
        }}
      >
        <KeyboardArrowDownIcon fontSize="large" />
      </IconButton>
      
      {/* Glowing accent at the bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-50px',
          left: '0',
          width: '100%',
          height: '100px',
          background: 'radial-gradient(ellipse at center, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0) 70%)',
          zIndex: 0,
        }}
      />
    </Box>
  );
};

export default HeroSection;