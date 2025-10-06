const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
    index: true
  },
  // Consultation metrics
  consultations: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    scheduled: { type: Number, default: 0 }
  },
  // Revenue metrics
  revenue: {
    total: { type: Number, default: 0 },
    consultationFees: { type: Number, default: 0 },
    averagePerConsultation: { type: Number, default: 0 }
  },
  // Patient metrics
  patients: {
    new: { type: Number, default: 0 },
    returning: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  // Doctor metrics
  doctors: {
    active: { type: Number, default: 0 },
    totalConsultations: { type: Number, default: 0 }
  },
  // Payment metrics
  payments: {
    total: { type: Number, default: 0 },
    byMethod: {
      card: { type: Number, default: 0 },
      gcash: { type: Number, default: 0 },
      paymaya: { type: Number, default: 0 },
      cash: { type: Number, default: 0 }
    }
  },
  // Specialty breakdown
  specialtyBreakdown: [{
    specialty: String,
    count: Number,
    revenue: Number
  }],
  // Doctor performance
  topDoctors: [{
    doctorId: mongoose.Schema.Types.ObjectId,
    doctorName: String,
    consultationCount: Number,
    revenue: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
analyticsSchema.index({ date: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
