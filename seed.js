import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Resource from './Resource.js';
import Booking from './Booking.js';
import Feedback from './Feedback.js';
import User from './User.js';
import Waitlist from './Waitlist.js';

const readCSV = (fileName) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, 'data', fileName);

    if (!fs.existsSync(csvPath)) {
      console.warn(`Warning: ${fileName} not found, skipping.`);
      resolve([]);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
      }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-resource-system');
    console.log('Connected to MongoDB for seeding');

    // Helper to safely get values case-insensitively
    const getVal = (row, key) => {
      const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
      return foundKey ? row[foundKey] : undefined;
    };

    const parseTs = (ts) => {
      if (!ts) return { date: '', time: '' };
      const parts = ts.replace('T', ' ').split(' ');
      if (parts.length >= 2) return { date: parts[0], time: parts[1].substring(0, 5) };
      return { date: ts, time: '' };
    };

    // 1. Import Resources
    const resourceData = await readCSV('resources.csv');
    if (resourceData.length > 0) {
      console.log('Resources headers detected:', Object.keys(resourceData[0]));
      await Resource.deleteMany({});
      const formattedResources = resourceData.map(r => {
        const id = getVal(r, 'resource_id') || getVal(r, 'id');
        if (!id) return null; // Skip empty rows
        
        let amenities = getVal(r, 'amenities');
        if (amenities && amenities.startsWith('{')) {
            amenities = amenities.replace(/^\{|\}$/g, '').split(',');
        } else {
            amenities = amenities ? amenities.split(';') : [];
        }

        return {
          _id: id,
          name: getVal(r, 'name'),
          type: getVal(r, 'type'),
          capacity: parseInt(getVal(r, 'capacity') || 0),
          building: getVal(r, 'building'),
          floor: parseInt(getVal(r, 'floor') || 0),
          amenities: amenities,
          utilization: parseInt(getVal(r, 'utilization') || 0),
          status: getVal(r, 'status') || 'optimal'
        };
      }).filter(Boolean);
      
      if (formattedResources.length > 0) {
        await Resource.insertMany(formattedResources);
        console.log(`Imported ${formattedResources.length} resources.`);
      }
    }

    // 2. Import Bookings
    const bookingData = await readCSV('bookings.csv');
    if (bookingData.length > 0) {
      console.log('Bookings headers detected:', Object.keys(bookingData[0]));
      await Booking.deleteMany({});
      const formattedBookings = bookingData.map(b => {
        const id = getVal(b, 'booking_id') || getVal(b, 'id');
        if (!id) return null;

        const startRaw = getVal(b, 'start_time');
        const endRaw = getVal(b, 'end_time');
        
        const start = parseTs(startRaw);
        const end = parseTs(endRaw);

        return {
          _id: id,
          studentId: getVal(b, 'user_id') || getVal(b, 'studentId'),
          resourceId: getVal(b, 'resource_id') || getVal(b, 'resourceId'),
          date: start.date,
          startTime: start.time,
          endTime: end.time,
          status: getVal(b, 'status') || 'upcoming',
          rating: undefined
        };
      }).filter(Boolean);
      
      if (formattedBookings.length > 0) {
        await Booking.insertMany(formattedBookings);
        console.log(`Imported ${formattedBookings.length} bookings.`);
      }
    }

    // 3. Import Feedback
    const feedbackData = await readCSV('feedback.csv');
    if (feedbackData.length > 0) {
      console.log('Feedback headers detected:', Object.keys(feedbackData[0]));
      await Feedback.deleteMany({});
      const formattedFeedback = feedbackData.map(f => {
        const id = getVal(f, 'feedback_id') || getVal(f, 'id');
        if (!id) return null;

        const createdRaw = getVal(f, 'created_at');
        const date = createdRaw ? createdRaw.split(' ')[0] : '';

        return {
          _id: id,
          studentId: getVal(f, 'user_id') || getVal(f, 'studentId'),
          rating: parseInt(getVal(f, 'rating') || 0),
          comment: getVal(f, 'comment'),
          date: date
        };
      }).filter(Boolean);
      
      if (formattedFeedback.length > 0) {
        await Feedback.insertMany(formattedFeedback);
        console.log(`Imported ${formattedFeedback.length} feedback entries.`);
      }
    }

    // 4. Import Users
    const userData = await readCSV('users.csv');
    if (userData.length > 0) {
      console.log('Users headers detected:', Object.keys(userData[0]));
      await User.deleteMany({});
      const formattedUsers = userData.map(u => {
        const id = getVal(u, 'user_id') || getVal(u, 'id');
        if (!id) return null;
        return {
          _id: id,
          email: getVal(u, 'email'),
          password: getVal(u, 'password') || 'password123',
          name: getVal(u, 'name') || getVal(u, 'full_name'),
          role: getVal(u, 'role') || 'student'
        };
      }).filter(Boolean);

      if (formattedUsers.length > 0) {
        await User.insertMany(formattedUsers);
        console.log(`Imported ${formattedUsers.length} users.`);
      }
    }

    // 5. Import Waitlist
    const waitlistData = await readCSV('waitlist.csv');
    if (waitlistData.length > 0) {
      console.log('Waitlist headers detected:', Object.keys(waitlistData[0]));
      await Waitlist.deleteMany({});
      const formattedWaitlist = waitlistData.map(w => {
        const id = getVal(w, 'waitlist_id') || getVal(w, 'id');
        if (!id) return null;

        const desiredStartRaw = getVal(w, 'desired_start_time');
        const startRaw = getVal(w, 'start_time');
        const start = parseTs(desiredStartRaw || startRaw);

        const date = getVal(w, 'date') || start.date;
        const startTime = start.time || getVal(w, 'start_time');
        
        let endTime = '';
        const endRaw = getVal(w, 'end_time');
        if (endRaw) {
            endTime = parseTs(endRaw).time || endRaw;
        } else if (startTime) {
             const [h, m] = startTime.split(':').map(Number);
             if (!isNaN(h)) {
                 endTime = `${((h + 1) % 24).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
             }
        }

        if (!date || !startTime || !endTime) return null;

        return {
          _id: id,
          studentId: getVal(w, 'user_id') || getVal(w, 'studentId'),
          resourceId: getVal(w, 'resource_id') || getVal(w, 'resourceId'),
          date: date,
          startTime: startTime,
          endTime: endTime,
          status: getVal(w, 'status') || 'waiting'
        };
      }).filter(Boolean);

      if (formattedWaitlist.length > 0) {
        await Waitlist.insertMany(formattedWaitlist);
        console.log(`Imported ${formattedWaitlist.length} waitlist entries.`);
      }
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();