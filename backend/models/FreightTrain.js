const mongoose = require('mongoose');

const freightTrainSchema = new mongoose.Schema({
  freight_id: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  origin_name: { type: String, required: true },
  destination: { type: String, required: true },
  destination_name: { type: String, required: true },
  departure_time: { type: Number, required: true }, // minutes since midnight
  arrival_time: { type: Number, required: true }, // minutes since midnight
  travel_time: { type: Number, required: true }, // minutes
  distance: { type: Number, required: true }, // km
  speed: { type: Number, required: true }, // km/h
  gap_utilization: { type: Number, required: true }, // percentage
  route: [{
    seq: Number,
    station_code: String,
    station_name: String,
    arrival_time: String,
    departure_time: String,
    distance: Number
  }],
  train_type: { type: String, default: 'freight' },
  generated_at: { type: Date, default: Date.now },
  valid_until: { type: Date, required: true } // 24 hours from generation
}, {
  timestamps: true
});

// Index for efficient querying
freightTrainSchema.index({ valid_until: 1 });
freightTrainSchema.index({ freight_id: 1 });

module.exports = mongoose.model('FreightTrain', freightTrainSchema);
