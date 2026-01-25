const mongoose = require('mongoose');

const conflictSchema = new mongoose.Schema({
    trainIds: [{ type: String }], // The IDs of trains involved
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    description: String,
    resolved: { type: Boolean, default: false },
    detectedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conflict', conflictSchema);