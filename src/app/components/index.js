require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-resource-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const Resource = require('./models/Resource');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Feedback = require('./models/Feedback');

// Routes

// Get all resources
app.get('/api/resources', async (req, res) => {
  try {
    const resources = await Resource.find().lean();
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } });

    const resourcesWithUtilization = resources.map(resource => {
      const resourceBookings = bookings.filter(b => 
        (b.resource && b.resource.toString() === resource._id.toString()) || 
        (b.resourceId && b.resourceId.toString() === resource._id.toString())
      );

      // Group bookings by time slot to calculate average occupancy per active hour
      const slots = {};
      resourceBookings.forEach(b => {
        const key = `${b.date}-${b.startTime}`;
        slots[key] = (slots[key] || 0) + 1;
      });

      const uniqueSlots = Object.keys(slots).length;
      const totalBookings = resourceBookings.length;
      const avgBookingsPerHour = uniqueSlots > 0 ? totalBookings / uniqueSlots : 0;

      // Utilization = (Avg Bookings per Hour / Max Capacity) * 100
      let utilization = Math.round((avgBookingsPerHour / (resource.capacity || 1)) * 100);
      utilization = Math.min(utilization, 100);

      let status = 'optimal';
      if (utilization >= 80) status = 'over-utilized';
      else if (utilization <= 30) status = 'under-utilized';

      return { ...resource, utilization, status };
    });
    res.json(resourcesWithUtilization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for a student
app.get('/api/bookings/:studentId', async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.params.studentId })
      .populate('resource')
      .sort({ date: 1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
  try {
    if (!req.body._id) {
      req.body._id = 'b' + Date.now();
    }
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ date: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create feedback
app.post('/api/feedback', async (req, res) => {
  try {
    if (!req.body._id) {
      req.body._id = 'f' + Date.now();
    }
    const newFeedback = new Feedback(req.body);
    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login (Basic implementation)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // In a real app, implement proper auth with JWT and password hashing
    const user = await User.findOne({ email, password });
    if (user) res.json(user);
    else res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;