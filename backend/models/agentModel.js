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
  modelType: {
    type: String,
    required: [true, 'Please select a model type'],
    enum: ['GPT-3', 'GPT-4', 'BERT', 'Custom']
  },
  customizationOptions: {
    tone: {
      type: String,
      enum: ['friendly', 'professional', 'casual', 'formal'],
      default: 'professional'
    },
    responseLength: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium'
    },
    specialties: [String]
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
