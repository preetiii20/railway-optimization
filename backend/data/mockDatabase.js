// backend/data/mockDatabase.js

class MockDatabase {
  constructor() {
    // All data stored in JavaScript arrays - no MongoDB needed!
    this.trains = [
      {
        id: 'train_1',
        trainId: "12951",
        name: "Rajdhani Express",
        type: "express",
        priority: 9,
        currentLocation: "section_1",
        latitude: 28.6139,
        longitude: 77.2090,
        status: "running",
        delay: 0,
        speed: 80
      },
      {
        id: 'train_2', 
        trainId: "14011",
        name: "Shan-e-Punjab",
        type: "express",
        priority: 8,
        currentLocation: "section_2",
        latitude: 28.6439,
        longitude: 77.2290,
        status: "delayed",
        delay: 15,
        speed: 60
      }
    ];
    
    this.sections = [
      {
        id: 'section_1',
        name: "Delhi-Ghaziabad Section",
        capacity: 3,
        length: 20,
        trainsInSection: ['train_1']
      },
      {
        id: 'section_2',
        name: "Ghaziabad-Kanpur Section", 
        capacity: 2,
        length: 30,
        trainsInSection: ['train_2']
      }
    ];
    
    console.log("📁 Mock Database initialized (no MongoDB needed!)");
  }
  
  // Simple CRUD operations
  getAllTrains() {
    return this.trains;
  }
  
  getTrainById(id) {
    return this.trains.find(train => train.id === id);
  }
  
  updateTrainPosition(id, lat, lng) {
    const train = this.getTrainById(id);
    if (train) {
      train.latitude = lat;
      train.longitude = lng;
      train.lastUpdated = new Date();
    }
  }
}

// Export single instance
module.exports = new MockDatabase();