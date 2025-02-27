const mongoose = require('mongoose');

const MarketplaceListingSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'one-time', 'subscription'],
      required: true
    },
    amount: {
      type: Number,
      validate: {
        validator: function(value) {
          // During updates, this.pricing might not be available
          // so we need to check if pricing.type exists before using it
          if (this.pricing && this.pricing.type === 'free') {
            return value === 0;
          } else if (this.pricing && this.pricing.type !== 'free') {
            return value > 0;
          }
          // If we can't determine the pricing type, allow any non-negative value
          return value >= 0;
        },
        message: 'Amount must be 0 for free agents and greater than 0 for paid agents'
      },
      min: [0, 'Price must be at least 0']
    },
    currency: {
      type: String,
      default: 'USD'
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
    required: true
  },
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for search
MarketplaceListingSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MarketplaceListing', MarketplaceListingSchema);
