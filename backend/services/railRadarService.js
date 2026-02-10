const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'indian-railway-irctc.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

// Search for train details by train number
const searchTrain = async (trainNumber) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/trains-search/v1/train/${trainNumber}`,
      {
        params: {
          isH5: 'true',
          client: 'web'
        },
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapid-api': 'rapid-api-database'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Train Search API Error:', error.message);
    throw error;
  }
};

// Fetch live train status by train number and departure date
const getLiveTrainStatus = async (trainNumber, departureDate) => {
  try {
    // Format: YYYYMMDD (e.g., 20240623)
    const formattedDate = departureDate || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    const response = await axios.get(
      `${BASE_URL}/api/trains/v1/train/status`,
      {
        params: {
          departure_date: formattedDate,
          isH5: 'true',
          client: 'web',
          train_number: trainNumber
        },
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapid-api': 'rapid-api-database'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Live Train Status API Error:', error.message);
    throw error;
  }
};

// Fetch multiple trains
const getMultipleTrains = async (trainNumbers, departureDate) => {
  try {
    const promises = trainNumbers.map(num => getLiveTrainStatus(num, departureDate));
    const results = await Promise.allSettled(promises);
    return results.map((result, index) => ({
      trainNumber: trainNumbers[index],
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  } catch (error) {
    console.error('Error fetching multiple trains:', error.message);
    throw error;
  }
};

module.exports = {
  searchTrain,
  getLiveTrainStatus,
  getMultipleTrains
};
