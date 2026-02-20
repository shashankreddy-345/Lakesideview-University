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
const Resource = require('./Resource');
const Booking = require('./Booking');
const User = require('./User');
const Feedback = require('./Feedback');

// Routes

// Get all resources
app.get('/api/resources', async (req, res) => {
  try {
    const resources = await Resource.find().lean();
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } });

    // Calculate total unique days across ALL bookings to establish the time window
    const allDates = new Set(bookings.map(b => b.date));
    const totalDays = Math.max(1, allDates.size);

    const resourcesWithUtilization = resources.map(resource => {
      const resourceBookings = bookings.filter(b => 
        (b.resource && b.resource.toString() === resource._id.toString()) || 
        (b.resourceId && b.resourceId.toString() === resource._id.toString())
      );

      // Logic: Average Hourly Utilization
      // For every hour: (number of bookings / capacity)
      let totalHourlyUtilization = 0;
      let totalHours = 0;

      allDates.forEach(date => {
        for (let hour = 8; hour < 22; hour++) {
          const slotStart = hour;
          const slotEnd = hour + 1;

          const bookingsInHour = resourceBookings.filter(b => {
            if (b.date !== date) return false;
            const [sH, sM] = b.startTime.split(':').map(Number);
            const [eH, eM] = b.endTime.split(':').map(Number);
            const start = sH + sM / 60;
            const end = eH + eM / 60;
            return start < slotEnd && end > slotStart;
          }).length;

          totalHourlyUtilization += Math.min(1, bookingsInHour / (resource.capacity || 1));
          totalHours++;
        }
      });

      let utilization = totalHours > 0 ? Math.round((totalHourlyUtilization / totalHours) * 100) : 0;
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

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, startTime: 1 });
    res.json(bookings);
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

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;