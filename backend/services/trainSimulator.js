/**
 * LIVE TRAIN SIMULATOR
 * Simulates realistic train movement at actual railway speeds
 */

const aiDataService = require('./aiDataService');
const liveConflictDetector = require('./liveConflictDetector');

class TrainSimulator {
  constructor() {
    this.trainStates = new Map(); // trainId -> {routeIndex, progress, speed, delay}
    this.stations = {};
    this.isRunning = false;
  }

  /**
   * Initialize simulator with train data
   */
  initialize() {
    const trains = aiDataService.getTrainsArray();
    this.stations = aiDataService.loadStations();

    trains.forEach(train => {
      if (train.route && train.route.length > 1) {
        // Initialize each train at a random position along its route
        const randomIndex = Math.floor(Math.random() * train.route.length);
        
        this.trainStates.set(train.train_id, {
          routeIndex: randomIndex,
          progress: 0, // 0 to 1 (percentage between stations)
          speed: this.getTrainSpeed(train.train_type), // km/h
          delay: 0, // minutes
          lastUpdate: Date.now(),
          currentStation: train.route[randomIndex].station_code
        });
      }
    });

    console.log(`✅ Train Simulator initialized with ${this.trainStates.size} trains`);
  }

  /**
   * Get realistic train speed based on type
   */
  getTrainSpeed(trainType) {
    const speeds = {
      'express': 80,      // 80 km/h
      'superfast': 100,   // 100 km/h
      'local': 60,        // 60 km/h
      'passenger': 50,    // 50 km/h
      'mail': 70          // 70 km/h
    };
    return speeds[trainType] || 60;
  }

  /**
   * Start the simulation
   */
  start(io) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚂 Train Simulator started');

    // Update train positions every 5 seconds (realistic time scale)
    this.updateInterval = setInterval(() => {
      this.updateAllTrains(io);
    }, 5000); // 5 seconds = 5 minutes in simulation time
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.isRunning = false;
      console.log('🛑 Train Simulator stopped');
    }
  }

  /**
   * Update all train positions
   */
  updateAllTrains(io) {
    const trains = aiDataService.getTrainsArray();
    const updatedTrains = [];

    trains.forEach(train => {
      if (!train.route || train.route.length < 2) return;

      const state = this.trainStates.get(train.train_id);
      if (!state) return;

      // Calculate time elapsed (in simulation time)
      const now = Date.now();
      const elapsedSeconds = (now - state.lastUpdate) / 1000;
      const simulationMinutes = elapsedSeconds / 60 * 60; // 1 real second = 1 simulation minute

      // Get current and next station
      const currentStop = train.route[state.routeIndex];
      const nextIndex = (state.routeIndex + 1) % train.route.length;
      const nextStop = train.route[nextIndex];

      // Calculate distance between stations
      const distance = Math.abs(nextStop.distance - currentStop.distance); // km
      
      // Calculate progress based on speed
      const progressIncrement = (state.speed * simulationMinutes / 60) / distance;
      state.progress += progressIncrement;

      // Check if reached next station
      if (state.progress >= 1) {
        state.progress = 0;
        state.routeIndex = nextIndex;
        state.currentStation = nextStop.station_code;

        // Random delay chance (10% chance of 2-10 minute delay)
        if (Math.random() < 0.1) {
          state.delay += Math.floor(Math.random() * 8) + 2;
        }

        // Update conflict detector
        liveConflictDetector.updateTrainPosition(
          train.train_id,
          state.currentStation,
          new Date(),
          state.speed
        );

        console.log(`🚂 Train ${train.train_id} arrived at ${state.currentStation}`);
      }

      state.lastUpdate = now;

      // Get interpolated position
      const currentStation = this.stations[currentStop.station_code];
      const nextStation = this.stations[nextStop.station_code];

      if (currentStation?.latitude && nextStation?.latitude) {
        const lat = currentStation.latitude + 
                   (nextStation.latitude - currentStation.latitude) * state.progress;
        const lng = currentStation.longitude + 
                   (nextStation.longitude - currentStation.longitude) * state.progress;

        updatedTrains.push({
          trainId: train.train_id,
          trainName: train.train_name,
          latitude: lat,
          longitude: lng,
          currentStation: state.currentStation,
          nextStation: nextStop.station_code,
          progress: state.progress,
          speed: state.speed,
          delay: state.delay,
          status: state.delay > 5 ? 'delayed' : 'on-time'
        });
      }
    });

    // Broadcast to all connected clients
    if (io) {
      io.emit('trainUpdate', updatedTrains);
      
      // Also broadcast conflicts
      const conflicts = liveConflictDetector.getActiveConflicts();
      io.emit('conflictUpdate', conflicts);
    }
  }

  /**
   * Get current train positions
   */
  getTrainPositions() {
    const trains = aiDataService.getTrainsArray();
    const positions = [];

    trains.forEach(train => {
      const state = this.trainStates.get(train.train_id);
      if (!state || !train.route) return;

      const currentStop = train.route[state.routeIndex];
      const nextIndex = (state.routeIndex + 1) % train.route.length;
      const nextStop = train.route[nextIndex];

      const currentStation = this.stations[currentStop.station_code];
      const nextStation = this.stations[nextStop.station_code];

      if (currentStation?.latitude && nextStation?.latitude) {
        const lat = currentStation.latitude + 
                   (nextStation.latitude - currentStation.latitude) * state.progress;
        const lng = currentStation.longitude + 
                   (nextStation.longitude - currentStation.longitude) * state.progress;

        positions.push({
          trainId: train.train_id,
          trainName: train.train_name,
          latitude: lat,
          longitude: lng,
          currentStation: state.currentStation,
          nextStation: nextStop.station_code,
          progress: (state.progress * 100).toFixed(1),
          speed: state.speed,
          delay: state.delay,
          status: state.delay > 5 ? 'delayed' : 'on-time'
        });
      }
    });

    return positions;
  }

  /**
   * Calculate train position based on schedule and current time
   * Used for freight trains with scheduled departure/arrival times
   * Now considers train speed for realistic movement
   */
  calculatePositionByTime(train, currentTimeMinutes) {
    if (!train.route || train.route.length < 2) return null;

    // Get train speed (default 60 km/h for freight)
    const trainSpeed = train.speed || 60; // km/h

    // Find which segment the train is currently on
    for (let i = 0; i < train.route.length - 1; i++) {
      const currentStop = train.route[i];
      const nextStop = train.route[i + 1];

      const departureTime = this.parseTimeToMinutes(currentStop.departure_time);
      const arrivalTime = this.parseTimeToMinutes(nextStop.arrival_time);

      // Check if train is between these two stations
      if (currentTimeMinutes >= departureTime && currentTimeMinutes <= arrivalTime) {
        const currentStation = this.stations[currentStop.station_code];
        const nextStation = this.stations[nextStop.station_code];

        if (!currentStation?.latitude || !nextStation?.latitude) continue;

        // Calculate distance between stations
        const distance = Math.abs(nextStop.distance - currentStop.distance); // km
        
        // Calculate expected travel time based on speed
        const expectedTravelTime = (distance / trainSpeed) * 60; // minutes
        
        // Calculate actual progress based on time elapsed
        const totalTime = arrivalTime - departureTime;
        const elapsedTime = currentTimeMinutes - departureTime;
        
        // Use speed-based calculation if available, otherwise use time-based
        let progress;
        if (expectedTravelTime > 0 && distance > 0) {
          // Speed-based: how far should train have traveled
          const distanceTraveled = (trainSpeed * (elapsedTime / 60)); // km
          progress = Math.min(distanceTraveled / distance, 1);
        } else {
          // Time-based fallback
          progress = totalTime > 0 ? elapsedTime / totalTime : 0;
        }

        // Interpolate position
        const lat = currentStation.latitude + 
                   (nextStation.latitude - currentStation.latitude) * progress;
        const lng = currentStation.longitude + 
                   (nextStation.longitude - currentStation.longitude) * progress;

        return {
          latitude: lat,
          longitude: lng,
          currentStation: currentStop.station_code,
          nextStation: nextStop.station_code,
          progress: (progress * 100).toFixed(1),
          segmentIndex: i,
          speed: trainSpeed,
          distanceTraveled: (progress * distance).toFixed(1),
          distanceRemaining: ((1 - progress) * distance).toFixed(1)
        };
      }
    }

    // Train hasn't started or has finished - return first/last station
    const firstStop = train.route[0];
    const lastStop = train.route[train.route.length - 1];
    const firstDeparture = this.parseTimeToMinutes(firstStop.departure_time);
    const lastArrival = this.parseTimeToMinutes(lastStop.arrival_time);

    if (currentTimeMinutes < firstDeparture) {
      // Train at origin
      const station = this.stations[firstStop.station_code];
      if (station?.latitude) {
        return {
          latitude: station.latitude,
          longitude: station.longitude,
          currentStation: firstStop.station_code,
          nextStation: train.route[1]?.station_code,
          progress: 0,
          segmentIndex: 0,
          speed: trainSpeed,
          status: 'waiting'
        };
      }
    } else if (currentTimeMinutes > lastArrival) {
      // Train at destination
      const station = this.stations[lastStop.station_code];
      if (station?.latitude) {
        return {
          latitude: station.latitude,
          longitude: station.longitude,
          currentStation: lastStop.station_code,
          nextStation: null,
          progress: 100,
          segmentIndex: train.route.length - 1,
          speed: 0,
          status: 'completed'
        };
      }
    }

    return null;
  }

  /**
   * Parse time string (HH:MM:SS) to minutes since midnight
   */
  parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    return hours * 60 + minutes;
  }

  /**
   * Get current time in minutes since midnight
   */
  getCurrentTimeMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  /**
   * Inject delay for testing
   */
  injectDelay(trainId, delayMinutes, cause = 'manual') {
    const state = this.trainStates.get(trainId);
    if (state) {
      state.delay += delayMinutes;
      console.log(`⏱️ Injected ${delayMinutes} min delay to train ${trainId}`);
      return true;
    }
    return false;
  }
}

// Singleton instance
const trainSimulator = new TrainSimulator();

module.exports = trainSimulator;
