const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    conflictId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conflict' },
    trainIds: [{ type: String }],
    decision: { type: String, required: true }, // e.g., "Hold T101 at Siding A"
    rationale: { type: String }, // Explanation for the controller
    expectedDelayReduction: { type: Number }, // In minutes
    status: { type: String, enum: ['pending', 'accepted', 'overridden'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);