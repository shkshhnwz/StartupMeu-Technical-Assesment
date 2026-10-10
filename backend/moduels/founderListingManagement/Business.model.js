const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [2, 'Business name must be at least 2 characters'],
      maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    tagline: {
      type: String,
      required: [true, 'Tagline is required'],
      trim: true,
      maxlength: [160, 'Tagline cannot exceed 160 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      enum: {
        values: [
          'SaaS',
          'Fintech',
          'Healthtech',
          'E-commerce',
          'AI',
          'Edtech',
          'Cleantech',
          'Enterprise',
          'Consumer',
          'Other'
        ],
        message: 'Invalid industry sector'
      },
      index: true
    },
    stage: {
      type: String,
      required: [true, 'Stage is required'],
      enum: {
        values: ['Idea', 'Early Revenue', 'Growth', 'Established'],
        message: 'Stage must be Idea, Early Revenue, Growth, or Established'
      },
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    fundingRequired: {
      type: Number,
      required: [true, 'Funding required amount is mandatory'],
      min: [1, 'Funding required must be a positive number']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: {
        values: ['INR', 'USD'],
        message: 'Currency must be INR or USD'
      },
      default: 'USD'
    },
    website: {
      type: String,
      default: null,
      trim: true
    },
    logoUrl: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['draft', 'published'],
        message: 'Status must be either draft or published'
      },
      default: 'draft',
      index: true
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

businessSchema.index({ status: 1, deletedAt: 1, createdAt: -1 });
businessSchema.index({ status: 1, deletedAt: 1, industry: 1, stage: 1 });
businessSchema.index({ owner: 1, deletedAt: 1, createdAt: -1 });
businessSchema.index({ businessName: 'text', tagline: 'text', description: 'text' });

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;
