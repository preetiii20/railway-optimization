const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    eventType: { type: String, required: true }, // e.g., "DECISION_ACCEPTED"
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: Object }, // Stores the snapshot of the decision
    outcome: { type: String }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);