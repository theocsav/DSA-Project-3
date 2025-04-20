// Common style objects for reuse across components
export const commonStyles = {
  // Glass panel effect used in multiple components
  glassPanel: {
    background: 'rgba(26, 26, 64, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
  },

  // Section styling used in homepage
  section: {
    py: 10,
    px: 3,
    width: '100%',
  },

  // Common heading style with gradient underline
  sectionHeading: {
    textAlign: 'center',
    color: 'white',
    mb: 6,
    fontWeight: 600,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '80px',
      height: '4px',
      bottom: '-12px',
      left: 'calc(50% - 40px)',
      background: 'linear-gradient(90deg, #2196F3, #21CBF3)',
    }
  },

  // Button hover effects
  buttonHover: {
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
    }
  },

  // Colors
  colors: {
    primary: '#2196F3',
    secondary: '#00e676',
    accent: '#ff6b6b',
    background: '#141432',
    backgroundDark: '#1a1a40',
  }
};

// Animation keyframes that can be reused
export const animations = {
  floatAnimation: {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
    '100%': { transform: 'translateY(0px)' },
  },
  fadeIn: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  writing: {
    '0%': { opacity: 0, transform: 'translateY(5px) rotate(-1deg)' },
    '100%': { opacity: 1, transform: 'translateY(0) rotate(-1deg)' },
  },
  gradientAnimation: {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
};