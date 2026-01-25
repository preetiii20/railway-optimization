const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true }, // Max trains allowed
    length: { type: Number, required: true }, // in km
    // Coordinates for the start and end of the track segment
    startCoords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    endCoords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: { type: String, enum: ['clear', 'congested', 'blocked'], default: 'clear' }
});

module.exports = mongoose.model('Section', sectionSchema);