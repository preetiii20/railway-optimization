const mongoose = require('mongoose');
require('dotenv').config();
const Train = require('./models/Train');
const Section = require('./models/Section');

const seedData = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await Train.deleteMany({});
    await Section.deleteMany({});

    // Create Sections (Track Segments)
    const sections = await Section.insertMany([
        { name: "Delhi-GZB", capacity: 3, length: 25, startCoords: { lat: 28.61, lng: 77.20 }, endCoords: { lat: 28.66, lng: 77.45 } },
        { name: "GZB-ALJN", capacity: 2, length: 100, startCoords: { lat: 28.66, lng: 77.45 }, endCoords: { lat: 27.88, lng: 78.08 } }
    ]);

    // Create 15 Mock Trains
    const trains = [];
    for (let i = 1; i <= 15; i++) {
        trains.push({
            trainId: `T${100 + i}`,
            name: i % 3 === 0 ? "Rajdhani Exp" : "Express Pass",
            priority: i % 3 === 0 ? 10 : 5,
            latitude: 28.61 + (Math.random() * 0.1),
            longitude: 77.20 + (Math.random() * 0.1),
            type: i % 3 === 0 ? 'express' : 'local',
            currentSection: sections[0]._id
        });
    }

    await Train.insertMany(trains);
    console.log("🌱 Database Seeded with 15 Trains!");
    process.exit();
};

seedData();