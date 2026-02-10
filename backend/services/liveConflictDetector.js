/**
 * LIVE CONFLICT DETECTION SERVICE
 * Detects conflicts in real-time based on current train positions
 */

const aiDataService = require('./aiDataService');

class LiveConflictDetector {
  constructor() {
    this.activeConflicts = [];
    this.trainPositions = new Map(); // trainId -> {station, time, speed}
  }

  /**
   * Update train position and check for conflicts
   */
  updateTrainPosition(trainId, currentStation, arrivalTime, speed = 60) {
    this.trainPositions.set(trainId, {
      station: currentStation,
      time: new Date(arrivalTime),
      speed: speed, // km/h
      lastUpdate: Date.now()
    });

    // Check for conflicts after position update
    this.detectConflicts();
  }

  /**
   * Detect conflicts in real-time
   */
  detectConflicts() {
    const trains = aiDataService.getTrainsArray();
    const newConflicts = [];

    // Check each pair of trains
    for (let i = 0; i < trains.length; i++) {
      for (let j = i + 1; j < trains.length; j++) {
        const train1 = trains[i];
        const train2 = trains[j];

        // Get current positions
        const pos1 = this.trainPositions.get(train1.train_id);
        const pos2 = this.trainPositions.get(train2.train_id);

        if (!pos1 || !pos2) continue;

        // 1. TRACK OCCUPANCY CONFLICT
        if (pos1.station === pos2.station) {
          const timeDiff = Math.abs(pos1.time - pos2.time) / 1000 / 60; // minutes
          
          if (timeDiff < 5) { // Within 5 minutes at same station
            newConflicts.push({
              id: `conflict_${train1.train_id}_${train2.train_id}_${Date.now()}`,
              type: 'track_occupancy',
              severity: 'high',
              train1_id: train1.train_id,
              train1_name: train1.train_name,
              train2_id: train2.train_id,
              train2_name: train2.train_name,
              station: pos1.station,
              time: new Date().toISOString(),
              description: `Both trains at ${pos1.station} within ${timeDiff.toFixed(1)} minutes`,
              detected_at: new Date().toLocaleTimeString()
            });
          }
        }

        // 2. PLATFORM CONFLICT
        // Check if trains are scheduled at same platform
        const route1Station = train1.route?.find(r => r.station_code === pos1.station);
        const route2Station = train2.route?.find(r => r.station_code === pos2.station);

        if (route1Station && route2Station && pos1.station === pos2.station) {
          const arrivalDiff = Math.abs(route1Station.arrival_minutes - route2Station.arrival_minutes);
          
          if (arrivalDiff < 10) { // Within 10 minutes
            newConflicts.push({
              id: `conflict_platform_${train1.train_id}_${train2.train_id}_${Date.now()}`,
              type: 'platform_conflict',
              severity: 'medium',
              train1_id: train1.train_id,
              train1_name: train1.train_name,
              train2_id: train2.train_id,
              train2_name: train2.train_name,
              station: pos1.station,
              time: new Date().toISOString(),
              description: `Platform conflict at ${pos1.station}`,
              detected_at: new Date().toLocaleTimeString()
            });
          }
        }

        // 3. SPEED CONFLICT (trains too close on same route)
        if (this.areTrainsOnSameRoute(train1, train2, pos1.station, pos2.station)) {
          const distance = this.calculateDistance(train1, train2, pos1.station, pos2.station);
          
          if (distance < 20) { // Less than 20km apart
            newConflicts.push({
              id: `conflict_speed_${train1.train_id}_${train2.train_id}_${Date.now()}`,
              type: 'speed_conflict',
              severity: 'high',
              train1_id: train1.train_id,
              train1_name: train1.train_name,
              train2_id: train2.train_id,
              train2_name: train2.train_name,
              station: pos1.station,
              time: new Date().toISOString(),
              description: `Trains too close: ${distance.toFixed(1)}km apart`,
              detected_at: new Date().toLocaleTimeString()
            });
          }
        }
      }
    }

    // Update active conflicts
    this.activeConflicts = newConflicts;
    return newConflicts;
  }

  /**
   * Check if two trains are on the same route segment
   */
  areTrainsOnSameRoute(train1, train2, station1, station2) {
    if (!train1.route || !train2.route) return false;

    const route1Stations = train1.route.map(r => r.station_code);
    const route2Stations = train2.route.map(r => r.station_code);

    // Check if both stations appear in both routes
    return route1Stations.includes(station1) && 
           route1Stations.includes(station2) &&
           route2Stations.includes(station1) && 
           route2Stations.includes(station2);
  }

  /**
   * Calculate distance between two trains
   */
  calculateDistance(train1, train2, station1, station2) {
    const route1 = train1.route?.find(r => r.station_code === station1);
    const route2 = train2.route?.find(r => r.station_code === station2);

    if (!route1 || !route2) return Infinity;

    return Math.abs(route1.distance - route2.distance);
  }

  /**
   * Get all active conflicts
   */
  getActiveConflicts() {
    return {
      total_conflicts: this.activeConflicts.length,
      conflicts: this.activeConflicts,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear old conflicts (older than 5 minutes)
   */
  clearOldConflicts() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.activeConflicts = this.activeConflicts.filter(conflict => {
      const conflictTime = new Date(conflict.time).getTime();
      return conflictTime > fiveMinutesAgo;
    });
  }

  /**
   * Get conflict statistics
   */
  getStatistics() {
    const highSeverity = this.activeConflicts.filter(c => c.severity === 'high').length;
    const mediumSeverity = this.activeConflicts.filter(c => c.severity === 'medium').length;
    const lowSeverity = this.activeConflicts.filter(c => c.severity === 'low').length;

    return {
      total: this.activeConflicts.length,
      high: highSeverity,
      medium: mediumSeverity,
      low: lowSeverity,
      byType: this.getConflictsByType()
    };
  }

  /**
   * Get conflicts grouped by type
   */
  getConflictsByType() {
    const types = {};
    this.activeConflicts.forEach(conflict => {
      types[conflict.type] = (types[conflict.type] || 0) + 1;
    });
    return types;
  }
}

// Singleton instance
const liveConflictDetector = new LiveConflictDetector();

// Clean up old conflicts every minute
setInterval(() => {
  liveConflictDetector.clearOldConflicts();
}, 60000);

module.exports = liveConflictDetector;
