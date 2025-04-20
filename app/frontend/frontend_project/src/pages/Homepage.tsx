import React from 'react';
import { Box, Typography, GlobalStyles, CssBaseline } from '@mui/material';

// Import our components
import SectionContainer from '../components/SectionContainer';
import HeroSection from '../components/homepage/HeroSection';
import WorkflowSteps from '../components/homepage/WorkflowSteps';
import TechnicalOverview from '../components/homepage/TechnicalOverview';
import TeamMemberCard from '../components/TeamMemberCard';
import AlgorithmCard from '../components/AlgorithmCard';
import { TeamMember } from '../components/TeamMemberCard';

// Import images
import tree from '../assets/tree.png';
import random from '../assets/random.png';
import { Grid } from '@mui/material';

// Main HomePage component
function HomePage() {
  // Team members data
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
      linkedInUrl: "https://www.linkedin.com/in/colgan-miller-0aaa082ba/"
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
          <Typography variant="h3" sx={{ 
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
          }}>
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
          <Typography variant="h3" sx={{ 
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
          }}>
            How They Work
          </Typography>
          <WorkflowSteps />
        </SectionContainer>

        {/* Technical Overview */}
        <SectionContainer background="#141432">
          <Typography variant="h3" sx={{ 
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
          }}>
            Technical Overview
          </Typography>
          <TechnicalOverview />
        </SectionContainer>

        {/* Team */}
        <SectionContainer 
          id="team" 
          background="linear-gradient(135deg,#141432 0%,#1a1a40 100%)" 
          position="relative"
        >
          <Typography variant="h3" sx={{ 
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
          }}>
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

export default HomePage;
