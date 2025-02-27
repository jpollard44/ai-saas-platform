import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  Stepper, 
  Step, 
  StepLabel,
  Paper,
  Grid,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExploreIcon from '@mui/icons-material/Explore';
import BuildIcon from '@mui/icons-material/Build';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import './OnboardingModal.css';

const steps = [
  {
    label: 'Welcome to Astro',
    icon: <ExploreIcon fontSize="large" />,
    description: 'Your all-in-one platform for creating, deploying, and monetizing AI agents.',
    points: [
      'Browse the marketplace for ready-to-use agents',
      'Create and customize your own AI agents',
      'Monetize your expertise by selling agents',
      'Join a community of AI builders'
    ]
  },
  {
    label: 'Create Your First Agent',
    icon: <BuildIcon fontSize="large" />,
    description: 'Start by creating a custom AI agent tailored to your needs.',
    points: [
      'Choose from pre-built templates or start from scratch',
      'Customize behavior, appearance, and capabilities',
      'Train with your own data for domain-specific knowledge',
      'Deploy with one click to make it available 24/7'
    ]
  },
  {
    label: 'Explore the Marketplace',
    icon: <StoreIcon fontSize="large" />,
    description: 'Find specialized AI agents built by our community of experts.',
    points: [
      'Browse categories to find agents for your use case',
      'Read reviews and ratings from other users',
      'Try before you buy with free previews',
      'Acquire agents to enhance your workflow instantly'
    ]
  },
  {
    label: 'Join the Community',
    icon: <PeopleIcon fontSize="large" />,
    description: 'Connect with other AI builders and enthusiasts.',
    points: [
      'Share your agent creations and get feedback',
      'Learn from tutorials and best practices',
      'Collaborate on building more powerful agents',
      'Stay updated on the latest AI advancements'
    ]
  }
];

const OnboardingModal = ({ open, onClose, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  useEffect(() => {
    // Reset to first step when modal is opened
    if (open) {
      setActiveStep(0);
    }
  }, [open]);

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped);
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);

    // If this is the last step, call onComplete
    if (activeStep === steps.length - 1) {
      onComplete();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="onboarding-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper 
        elevation={5} 
        sx={{ 
          width: '80%', 
          maxWidth: 800, 
          p: 4, 
          position: 'relative', 
          borderRadius: 2, 
          maxHeight: '90vh', 
          overflowY: 'auto' 
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => {
            const stepProps = {};
            const labelProps = {};
            
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            
            return (
              <Step key={step.label} {...stepProps}>
                <StepLabel {...labelProps}>{step.label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        
        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              You're all set!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You're now ready to explore the Astro AI platform. Start by creating your first agent or exploring the marketplace.
            </Typography>
            <Button variant="contained" color="primary" onClick={onClose}>
              Get Started
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {steps[activeStep].icon}
              <Typography variant="h5" component="h2" gutterBottom>
                {steps[activeStep].label}
              </Typography>
              <Typography variant="body1">
                {steps[activeStep].description}
              </Typography>
            </Box>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Grid container spacing={2}>
                {steps[activeStep].points.map((point, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      <Typography variant="body2">{point}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                color="inherit" 
                disabled={activeStep === 0} 
                onClick={handleBack} 
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="text" color="secondary" onClick={handleSkip}>
                  Skip Tutorial
                </Button>
                <Button variant="contained" onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
};

export default OnboardingModal;
