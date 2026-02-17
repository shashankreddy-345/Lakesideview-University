require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Resource = require('./models/Resource');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-resource-system')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const importResources = () => {
  const results = [];
  const csvPath = path.join(__dirname, 'data', 'resources.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => {
      // Map CSV columns to Schema fields
      // Assumes CSV headers: name,type,capacity,building,floor,amenities
      results.push({
        name: data.name,
        type: data.type,
        capacity: parseInt(data.capacity),
        building: data.building,
        floor: parseInt(data.floor),
        amenities: data.amenities ? data.amenities.split(';') : []
      });
    })
    .on('end', async () => {
      await Resource.deleteMany({}); // Clear existing data
      await Resource.insertMany(results);
      console.log(`${results.length} resources imported successfully.`);
      process.exit();
    });
};

importResources();