const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
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
  agentConfig: {
    modelType: {
      type: String,
      required: true
    },
    customizationOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  category: {
    type: String,
    enum: [
      'Customer Support',
      'Content Creation',
      'Data Analysis',
      'Education',
      'Productivity',
      'Entertainment',
      'Other'
    ],
    default: 'Other'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Template', TemplateSchema);
