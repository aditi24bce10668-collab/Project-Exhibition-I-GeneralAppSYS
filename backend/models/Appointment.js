const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  specialist: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialist', required: true },
  datetime: { type: Date, required: true },
  duration: { type: Number, default: 30 }, // minutes
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  autoConfirmed: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

