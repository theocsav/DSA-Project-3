import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { GlobalStyles, CssBaseline, Container, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Import images
import tree from '../assets/tree.png';
import random from '../assets/random.png';

// Types
interface TeamMember {
  name: string;
  role: string;
  color: string;
  initials: string;
  githubUrl: string;
  linkedInUrl: string;
}

interface AlgorithmProps {
  title: string;
  icon: string;
  color: string;
  description: string;
  points: string[];
}

// Shared styles
const styles = {
  section: {
    py: 10,
    px: 3,
    width: '100%',
  },
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
  glassMorphism: {
    background: 'rgba(26, 26, 64, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
  }
};

function HomePage() {
  const teamMembers: TeamMember[] = [
    {
      name: "Cesar Valentin",
      role: "Backend",
      color: "#2196F3",
      initials: "CV",
      githubUrl: "https://github.com/XxMasterepicxX",
      linkedInUrl: "https://www.linkedin.com/in/cesar-valentin-0103a8281/"
    },
    {
      name: "Colgan Miller",
      role: "Data",
      color: "#00e676",
      initials: "CM",
      githubUrl: "https://github.com/Colganmiller",
      linkedInUrl: "https://www.linkedin.com/in/colgan-miller/"
    },
    {
      name: "Vasco Hinostroza",
      role: "Frontend",
      color: "#ff6b6b",
      initials: "VH",
      githubUrl: "https://github.com/theocsav",
      linkedInUrl: "https://www.linkedin.com/in/vasco-hinostroza/"
    }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: { scrollBehavior: 'smooth' },
          body: { margin: 0, padding: 0, backgroundColor: '#141432', overflowX: 'hidden' },
          '#root': { maxWidth: '100%', margin: 0, padding: 0 },
          '@keyframes floatAnimation': {
            '0%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
            '100%': { transform: 'translateY(0px)' },
          },
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@import': "url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap')",
        }}
      />

      <Box sx={{ 
        width: '100vw', 
        maxWidth: '100%',
        overflowX: 'hidden',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        {/* Hero Section */}
        <HeroSection scrollToSection={scrollToSection} />
        
        {/* Algorithms Section */}
        <SectionContainer 
          id="algorithms" 
          background="linear-gradient(135deg, #1a1a40 0%, #141432 100%)"
        >
          <Typography variant="h3" sx={styles.sectionHeading}>
            Our Detection Algorithms
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 4, sm: 3, md: 6 },
              justifyContent: 'center',
              alignItems: { xs: 'center', sm: 'stretch' },
              flexWrap: 'wrap'
            }}
          >
            <Box sx={{ 
              width: { xs: '100%', sm: '45%', md: '45%' },
              maxWidth: '500px',
            }}>
              <AlgorithmCard
                title="Random Forest"
                icon={random}
                color="#00e676"
                description="A robust supervised model building multiple decision trees to uncover complex fraud patterns."
                points={[
                  "Aggregates diverse decision trees to boost accuracy and prevent overfitting",
                  "Highlights critical fraud indicators with feature importance insights",
                  "Seamlessly handles large datasets and missing values",
                  "Balances precision and recall for reliable fraud detection"
                ]}
              />
            </Box>
            <Box sx={{ 
              width: { xs: '100%', sm: '45%', md: '45%' },
              maxWidth: '500px',
            }}>
              <AlgorithmCard
                title="Isolation Forest"
                icon={tree}
                color="#2196F3"
                description="An unsupervised model isolating anomalies in high-dimensional data for efficient fraud detection."
                points={[
                  "Detects outliers by isolating anomalous points in shorter tree paths",
                  "Requires minimal preprocessing and scales to high-dimensional datasets",
                  "Offers linear time complexity with low memory footprint",
                  "Adjustable thresholds allow customized sensitivity"
                ]}
              />
            </Box>
          </Box>
        </SectionContainer>

        {/* How It Works */}
        <SectionContainer id="how-it-works" background="#141432">
          <Typography variant="h3" sx={styles.sectionHeading}>
            How They Work
          </Typography>
          <WorkflowSteps />
        </SectionContainer>

        {/* Technical Overview */}
        <SectionContainer background="#141432">
          <Typography variant="h3" sx={styles.sectionHeading}>
            Technical Overview
          </Typography>
          <TechnicalOverview />
        </SectionContainer>

        {/*<SectionContainer background="linear-gradient(135deg,#1a1a40 0%,#141432 100%)">
          <Typography variant="h3" sx={styles.sectionHeading}>
            Use Cases
          </Typography>
          <UseCasesGrid />
        </SectionContainer>*/}


        {/* Team */}
        <SectionContainer 
          id="team" 
          background="linear-gradient(135deg,#141432 0%,#1a1a40 100%)" 
          position="relative"
        >
          <Typography variant="h3" sx={styles.sectionHeading}>
            Our Team
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map(member => (
              <Grid item xs={12} sm={6} md={4} key={member.name}>
                <TeamMemberCard {...member} />
              </Grid>
            ))}
          </Grid>
        </SectionContainer>

        {/* Footer */}
        <Box sx={{ 
          py: 4, 
          px: 3, 
          width: '100%', 
          background: 'rgba(20,20,50,0.95)', 
          textAlign: 'center' 
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © {new Date().getFullYear()} Fraud Detection System — DSA Project
          </Typography>
        </Box>
      </Box>
    </>
  );
}

// Section Container Component
const SectionContainer = ({ 
  children, 
  id, 
  background, 
  position = 'static',
  py = 10
}) => (
  <Box 
    id={id} 
    sx={{ 
      ...styles.section,
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

// Hero Section Component
const HeroSection = ({ scrollToSection }) => {
  React.useEffect(() => {
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
        {/* Replace floating cards with animated feature highlights */}
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
        }}>
        </Box>
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

// Feature Card Component for Hero Section
const FeatureCard = ({ icon, title, color, style = {} }) => (
  <Paper
    elevation={3}
    sx={{
      position: 'relative',
      p: 2,
      width: '160px',
      background: 'rgba(26, 26, 64, 0.6)',
      backdropFilter: 'blur(8px)',
      borderRadius: '15px',
      border: `1px solid rgba(255, 255, 255, 0.1)`,
      transform: `rotate(${Math.random() * 6 - 3}deg)`,
      animation: `float ${Math.random() * 4 + 8}s ease-in-out infinite alternate`,
      boxShadow: `0 5px 15px rgba(0, 0, 0, 0.3), 0 0 20px ${color}33`,
      ...style
    }}
  >
    <Box sx={{ fontSize: '2rem', mb: 1, color }}>{icon}</Box>
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
      {title}
    </Typography>
  </Paper>
);

// Workflow Steps Component
const WorkflowSteps = () => {
  const steps = [
    { step: 1, title: 'Data Ingestion & Cleansing', description: 'Aggregate, clean, and prepare transaction data for analysis.' },
    { step: 2, title: 'Feature Engineering', description: 'Extract and normalize key attributes to enhance model performance.' },
    { step: 3, title: 'Model Evaluation', description: 'Train algorithms on historical data and score new transactions.' },
    { step: 4, title: 'Alert & Report', description: 'Flag suspicious activity, show patterns, and deliver insights.' }
  ];

  return (
    <Grid container spacing={3}>
      {steps.map(item => (
        <Grid item xs={12} md={3} key={item.step}>
          <Paper sx={{ 
            p: 3, 
            height: '100%', 
            ...styles.glassMorphism, 
            position: 'relative' 
          }}>
            <Typography variant="h1" sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -10, 
              fontSize: '120px', 
              fontWeight: 800, 
              opacity: 0.06, 
              color: '#fff' 
            }}>
              {item.step}
            </Typography>
            <Typography variant="h5" sx={{ color: '#2196F3', mb: 1 }}>
              {item.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {item.description}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// Technical Overview Component
const TechnicalOverview = () => (
  <Paper sx={{ 
    p: 4, 
    ...styles.glassMorphism
  }}>
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>Front-End Stack</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
          {['React', 'Vite', 'Material UI'].map(tech => (
            <Chip 
              key={tech} 
              label={tech} 
              sx={{ 
                background: 'rgba(33,150,243,0.1)', 
                color: '#2196F3', 
                borderRadius: '8px', 
                border: '1px solid rgba(33,150,243,0.3)' 
              }} 
            />
          ))}
        </Box>
        <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>Data Visualization</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Interactive charts and dashboards for real-time fraud monitoring and analysis.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ color: '#00e676', mb: 2 }}>Back-End Stack</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
          {['Django', 'pandas', 'NumPy'].map(tech => (
            <Chip 
              key={tech} 
              label={tech} 
              sx={{ 
                background: 'rgba(0,230,118,0.1)', 
                color: '#00e676', 
                borderRadius: '8px', 
                border: '1px solid rgba(0,230,118,0.3)' 
              }} 
            />
          ))}
        </Box>
        <Typography variant="h6" sx={{ color: '#00e676', mb: 2 }}>ML Implementation</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Optimized Random Forest and Isolation Forest models with tunable parameters for optimal performance.
        </Typography>
      </Grid>
    </Grid>
  </Paper>
);

// Use Cases Grid Component
const UseCasesGrid = () => {
  const useCases = [
    { title: 'Banking & Finance', icon: '💳', description: 'Prevent fraudulent transactions and safeguard financial assets.' },
    { title: 'E-commerce', icon: '🛒', description: 'Secure online marketplaces against payment fraud.' },
    { title: 'Insurance', icon: '🔐', description: 'Detect suspicious claims to reduce insurance losses.' },
    { title: 'Healthcare', icon: '🏥', description: 'Ensure billing accuracy by flagging anomalous claims.' }
  ];

  return (
    <Grid container spacing={4}>
      {useCases.map(useCase => (
        <Grid item xs={12} sm={6} key={useCase.title}>
          <Box sx={{ 
            display: 'flex', 
            p: 3, 
            background: 'rgba(26,26,64,0.4)', 
            borderRadius: '16px', 
            transition: 'all 0.3s', 
            '&:hover': { 
              background: 'rgba(33,150,243,0.1)', 
              transform: 'translateY(-3px)' 
            } 
          }}>
            <Box sx={{ fontSize: '2.5rem', mr: 3, display: 'flex', alignItems: 'center' }}>
              {useCase.icon}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                {useCase.title}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {useCase.description}
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

// Statistics Grid Component
const StatisticsGrid = () => {
  const stats = [
    { value: '99%+', label: 'Detection Accuracy' },
    { value: '<0.5s', label: 'Avg. Response Time' },
    { value: '500K+', label: 'Transactions Processed' },
    { value: '95%', label: 'Client Satisfaction' }
  ];

  return (
    <Grid container spacing={3} justifyContent="center">
      {stats.map(stat => (
        <Grid item xs={6} md={3} key={stat.label}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: '#2196F3', fontWeight: 700 }}>
              {stat.value}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {stat.label}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

// FAQ Grid Component
const FAQGrid = () => {
  const faqs = [
    { question: "How does Random Forest detect fraud?", answer: "It builds multiple decision trees and uses majority voting to classify transactions based on learned patterns." },
    { question: "Why use Isolation Forest?", answer: "It isolates anomalies in fewer tree splits, making it efficient for unsupervised outlier detection." },
    { question: "Can I adjust model sensitivity?", answer: "Yes—tune parameters like number of trees, sample size, and detection threshold to suit your needs." },
    { question: "What data powers this demo?", answer: "Synthetic transactions modeled after real-world scenarios to ensure privacy while showcasing capability." }
  ];

  return (
    <Grid container spacing={4}>
      {faqs.map((item, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#2196F3', mb: 1 }}>
              {item.question}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {item.answer}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

// Algorithm Card Component
function AlgorithmCard({ title, icon, color, description, points }: AlgorithmProps) {
  return (
    <Paper 
      elevation={8} 
      sx={{ 
        p: 4, 
        ...styles.glassMorphism,
        transition: 'all 0.3s', 
        color: 'white', 
        '&:hover': {
          transform: 'translateY(-5px)', 
          boxShadow: '0 15px 30px rgba(0,0,0,0.4)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ 
          mr: 2, 
          p: 2, 
          borderRadius: '50%', 
          background: color, 
          width: 60, 
          height: 60, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 8px 16px rgba(0,0,0,0.25)' 
        }}>
          <img 
            src={icon} 
            alt={`${title} icon`} 
            style={{ 
              width: '60%', 
              height: 'auto', 
              filter: 'brightness(0) invert(1)' 
            }} 
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.75rem' }}>
          {title}
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, mb: 3 }}>
        {description}
      </Typography>
      
      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Typography variant="h6" sx={{ color: color, mb: 2, fontWeight: 600 }}>
        Key Features:
      </Typography>
      
      {points.map((point, i) => (
        <Box key={i} sx={{ display: 'flex', mb: 2 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: color, 
            mt: 1, 
            mr: 2 
          }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {point}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}

// Team Member Card Component
function TeamMemberCard({ name, role, color, initials, githubUrl, linkedInUrl }: TeamMember) {
  return (
    <Paper 
      elevation={4} 
      sx={{ 
        p: 3, 
        ...styles.glassMorphism,
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        transition: 'all 0.3s', 
        width: '300px',
        color: 'white',
        '&:hover': {
          background: 'rgba(33,33,75,0.95)', 
          transform: 'translateY(-4px)', 
          boxShadow: '0 12px 20px rgba(0,0,0,0.3)'
        }
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Avatar sx={{ 
          bgcolor: color, 
          width: 80, 
          height: 80, 
          margin: '0 auto',
          mb: 2, 
          fontSize: '1.8rem' 
        }}>
          {initials}
        </Avatar>
        <Typography variant="h5" sx={{ mb: 1 }}>
          {name}
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {role}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
        <IconButton 
          aria-label="GitHub" 
          href={githubUrl} 
          target="_blank" 
          sx={{ 
            color: '#2196F3', 
            border: '1.5px solid rgba(33,150,243,0.5)', 
            p: 1,
            '&:hover': {
              backgroundColor: 'rgba(33,150,243,0.12)', 
              borderColor: '#2196F3',
              transform: 'translateY(-2px)'
            } 
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </IconButton>
        <IconButton 
          aria-label="LinkedIn" 
          href={linkedInUrl} 
          target="_blank" 
          sx={{ 
            color: '#2196F3', 
            border: '1.5px solid rgba(33,150,243,0.5)', 
            p: 1,
            '&:hover': {
              backgroundColor: 'rgba(33,150,243,0.12)', 
              borderColor: '#2196F3',
              transform: 'translateY(-2px)'
            } 
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </IconButton>
      </Box>
    </Paper>
  );
}

export default HomePage;
