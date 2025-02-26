const Agent = require('../models/agentModel');
const MarketplaceListing = require('../models/marketplaceModel');

// @desc    Get analytics for an agent
// @route   GET /api/analytics/:agentId
// @access  Private
exports.getAgentAnalytics = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Ensure user owns the agent
    if (agent.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this agent'
      });
    }

    // Get marketplace listing if exists
    const listing = await MarketplaceListing.findOne({ agentId: agent._id });

    // Mock usage statistics
    const usageStats = {
      tasks: agent.stats.usageCount || Math.floor(Math.random() * 100),
      averageResponseTime: agent.stats.averageResponseTime || Math.floor(Math.random() * 500 + 50) // 50-550ms
    };

    // Mock revenue data for marketplace agents
    let revenue = 0;
    if (listing) {
      if (listing.pricing.type === 'subscription') {
        revenue = listing.pricing.amount * Math.floor(Math.random() * 20); // Subscriptions
      } else if (listing.pricing.type === 'one-time') {
        revenue = listing.pricing.amount * Math.floor(Math.random() * 10); // Purchases
      }
    }

    // Mock usage by time period
    const dailyUsage = Array.from({ length: 7 }, () => Math.floor(Math.random() * 20));
    const weeklyUsage = Array.from({ length: 4 }, () => Math.floor(Math.random() * 50));
    const monthlyUsage = Array.from({ length: 6 }, () => Math.floor(Math.random() * 200));

    res.status(200).json({
      success: true,
      data: {
        usageStats,
        revenue,
        timeBasedUsage: {
          daily: dailyUsage,
          weekly: weeklyUsage,
          monthly: monthlyUsage
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard analytics for a user
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    // Get all user's agents
    const agents = await Agent.find({ userId: req.user.id });
    
    // Get all marketplace listings for user's agents
    const agentIds = agents.map(agent => agent._id);
    const listings = await MarketplaceListing.find({ agentId: { $in: agentIds } });

    // Calculate total agents and published agents
    const totalAgents = agents.length;
    const publishedAgents = listings.length;

    // Calculate total usage across all agents
    const totalTasks = agents.reduce((sum, agent) => sum + (agent.stats.usageCount || 0), 0) || 
                      Math.floor(Math.random() * 500); // Mock data if no real usage
    
    // Mock total revenue
    const totalRevenue = listings.reduce((sum, listing) => {
      if (listing.pricing.type === 'free') return sum;
      
      const baseRevenue = listing.pricing.amount;
      if (listing.pricing.type === 'subscription') {
        return sum + (baseRevenue * Math.floor(Math.random() * 20));
      } else {
        return sum + (baseRevenue * Math.floor(Math.random() * 10));
      }
    }, 0);

    // Mock monthly growth
    const monthlyGrowth = {
      users: Array.from({ length: 6 }, (_, i) => ({ 
        month: i + 1, 
        count: Math.floor(Math.random() * 30) + (i * 5) 
      })),
      revenue: Array.from({ length: 6 }, (_, i) => ({ 
        month: i + 1, 
        amount: Math.floor(Math.random() * 500) + (i * 100) 
      })),
      usage: Array.from({ length: 6 }, (_, i) => ({ 
        month: i + 1, 
        count: Math.floor(Math.random() * 1000) + (i * 200) 
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        agentStats: {
          total: totalAgents,
          published: publishedAgents
        },
        usageStats: {
          totalTasks,
          lastMonth: Math.floor(totalTasks * 0.7)
        },
        revenueStats: {
          total: totalRevenue,
          lastMonth: Math.floor(totalRevenue * 0.8)
        },
        growthData: monthlyGrowth
      }
    });
  } catch (err) {
    next(err);
  }
};
