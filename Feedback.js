import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Matches CSV 'id' column
  studentId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: String,
  date: { type: String, required: true }
}, { timestamps: true, _id: false });

export default mongoose.model('Feedback', feedbackSchema);