const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
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
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);