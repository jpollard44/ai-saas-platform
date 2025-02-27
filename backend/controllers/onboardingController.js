const User = require('../models/userModel');
const Agent = require('../models/agentModel');

// @desc    Get onboarding status
// @route   GET /api/onboarding/status
// @access  Private
exports.getOnboardingStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Define onboarding steps and check completion
    const onboardingSteps = {
      profileCompleted: Boolean(
        user.name && 
        user.email && 
        user.bio
      ),
      createdFirstAgent: false,
      exploredMarketplace: Boolean(user.hasExploredMarketplace),
      acquiredAgent: Boolean(user.acquiredAgents && user.acquiredAgents.length > 0),
      publishedAgent: false
    };
    
    // Check if user has created any agents
    const userAgentsCount = await Agent.countDocuments({ userId: user.id });
    onboardingSteps.createdFirstAgent = userAgentsCount > 0;
    
    // Check if user has published any agents to the marketplace
    const publishedAgentsCount = await Agent.countDocuments({ 
      userId: user.id,
      isPublished: true
    });
    onboardingSteps.publishedAgent = publishedAgentsCount > 0;
    
    // Calculate overall progress (percentage)
    const totalSteps = Object.keys(onboardingSteps).length;
    const completedSteps = Object.values(onboardingSteps).filter(Boolean).length;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    
    // Determine next recommended action
    let nextAction = '';
    if (!onboardingSteps.profileCompleted) {
      nextAction = 'Complete your profile';
    } else if (!onboardingSteps.createdFirstAgent) {
      nextAction = 'Create your first agent';
    } else if (!onboardingSteps.exploredMarketplace) {
      nextAction = 'Explore the marketplace';
    } else if (!onboardingSteps.acquiredAgent) {
      nextAction = 'Acquire an agent from the marketplace';
    } else if (!onboardingSteps.publishedAgent) {
      nextAction = 'Publish an agent to the marketplace';
    } else {
      nextAction = 'Your onboarding is complete!';
    }
    
    res.status(200).json({
      success: true,
      data: {
        steps: onboardingSteps,
        progress,
        nextAction
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update onboarding step
// @route   PUT /api/onboarding/step/:step
// @access  Private
exports.updateOnboardingStep = async (req, res, next) => {
  try {
    const { step } = req.params;
    const validSteps = ['exploredMarketplace'];
    
    if (!validSteps.includes(step)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid onboarding step'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update the specific step
    switch (step) {
      case 'exploredMarketplace':
        user.hasExploredMarketplace = true;
        break;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Onboarding step '${step}' updated successfully`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get onboarding tips for a specific page
// @route   GET /api/onboarding/tips/:page
// @access  Private
exports.getOnboardingTips = async (req, res, next) => {
  try {
    const { page } = req.params;
    
    // Define tips for different pages
    const tips = {
      dashboard: [
        'Welcome to your dashboard! This is where you can see an overview of your agents.',
        'Click on "Create Agent" to build your first AI assistant.',
        'Check the "Recent Activity" section to see what\'s happening with your agents.'
      ],
      createAgent: [
        'Choose a template to get started quickly, or build from scratch.',
        'Give your agent a clear name and description to help users understand its purpose.',
        'Add knowledge sources to make your agent more intelligent and helpful.'
      ],
      marketplace: [
        'Browse the marketplace to find agents created by other users.',
        'Use filters to narrow down your search by category, price, or rating.',
        'Try out free agents to see how they can help you.'
      ],
      agentDetail: [
        'Test your agent by asking it questions in the chat interface.',
        'Monitor your agent\'s performance in the analytics tab.',
        'Share your agent with others by publishing it to the marketplace.'
      ],
      settings: [
        'Update your profile information to help others know who you are.',
        'Configure your notification preferences to stay informed.',
        'Manage your subscription and billing information here.'
      ]
    };
    
    if (!tips[page]) {
      return res.status(404).json({
        success: false,
        error: 'Tips not found for this page'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tips[page]
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Skip onboarding
// @route   PUT /api/onboarding/skip
// @access  Private
exports.skipOnboarding = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    user.hasSkippedOnboarding = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Onboarding skipped successfully'
    });
  } catch (err) {
    next(err);
  }
};
