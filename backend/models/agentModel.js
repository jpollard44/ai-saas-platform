const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  modelId: {
    type: String,
    required: [true, 'Please select a model'],
    enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-2', 'llama-2']
  },
  templateId: {
    type: String,
    required: false,
    enum: ['customer-support', 'content-writer', 'research-assistant', 'coding-assistant', 'data-analyst', 'blank']
  },
  instructions: {
    type: String,
    required: [true, 'Please provide instructions for the agent'],
    trim: true
  },
  temperature: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1
  },
  maxTokens: {
    type: Number,
    default: 800,
    min: 50,
    max: 4000
  },
  enableWebSearch: {
    type: Boolean,
    default: false
  },
  enableKnowledgeBase: {
    type: Boolean,
    default: false
  },
  enableMemory: {
    type: Boolean,
    default: true
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'one-time', 'subscription'],
      default: 'free'
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function(value) {
          if (this.pricing && this.pricing.type === 'free') {
            return value === 0;
          } else if (this.pricing && this.pricing.type !== 'free') {
            return value > 0;
          }
          return value >= 0;
        },
        message: 'Amount must be 0 for free agents and greater than 0 for paid agents'
      }
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  visibility: {
    type: String,
    enum: ['private', 'public', 'marketplace'],
    default: 'private'
  },
  datasetPath: {
    type: String,
    default: null
  },
  isFineTuned: {
    type: Boolean,
    default: false
  },
  apiKey: {
    type: String,
    select: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deploymentStatus: {
    type: String,
    enum: ['draft', 'deployed', 'inactive'],
    default: 'draft'
  },
  stats: {
    usageCount: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    }
  }
});

module.exports = mongoose.model('Agent', AgentSchema);
