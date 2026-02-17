import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Matches CSV 'id' column
  studentId: { type: String, required: false }, // Made optional for guest bookings
  resourceId: { type: String, ref: 'Resource', required: true }, // References Resource._id
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startTime: { type: String, required: true }, // Format: HH:mm
  endTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  rating: Number
}, { timestamps: true, _id: false });

export default mongoose.model('Booking', bookingSchema);