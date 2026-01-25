const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    trainId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['express', 'local', 'freight'], default: 'local' },
    priority: { type: Number, min: 1, max: 10, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, enum: ['running', 'delayed', 'stopped'], default: 'running' },
    delay: { type: Number, default: 0 }, // in minutes
    currentSection: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Train', trainSchema);