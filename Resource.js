import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Matches CSV 'id' column (e.g., 'r1')
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true 
  },
  capacity: { type: Number, required: true },
  building: { type: String, required: true },
  floor: { type: Number, required: true },
  amenities: [String],
  utilization: { type: Number, default: 0 },
  status: { type: String, default: 'optimal' }
}, { timestamps: true, _id: false }); // _id: false prevents Mongo from overwriting our String ID

export default mongoose.model('Resource', resourceSchema);