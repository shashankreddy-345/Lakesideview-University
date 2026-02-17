import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  studentId: { type: String, required: true },
  resourceId: { type: String, ref: 'Resource', required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['waiting', 'allocated', 'expired', 'cancelled'],
    default: 'waiting'
  }
}, { timestamps: true, _id: false });

export default mongoose.model('Waitlist', waitlistSchema);