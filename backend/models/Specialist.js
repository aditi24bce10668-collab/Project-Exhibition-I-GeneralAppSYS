const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  bio: String,
  qualifications: [String],
  slotDuration: { type: Number, default: 30 }, // minutes
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Specialist', specialistSchema);

