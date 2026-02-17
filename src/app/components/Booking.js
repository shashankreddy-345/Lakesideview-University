const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: { type: String, required: false },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startTime: { type: String, required: true }, // Format: HH:mm
  endTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  rating: Number,
  feedback: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);