const mongoose = require('mongoose');

const consultationHistorySchema = new mongoose.Schema({
  originalConsultationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorSpecialty: {
    type: String,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  symptoms: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  archivedAt: {
    type: Date,
    default: Date.now
  },
  originalCreatedAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('ConsultationHistory', consultationHistorySchema);
