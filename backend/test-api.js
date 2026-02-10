// Quick test script for Indian Railway IRCTC API
require('dotenv').config();
const { searchTrain, getLiveTrainStatus } = require('./services/railRadarService');

async function testAPI() {
  console.log('🧪 Testing Indian Railway IRCTC API Integration...\n');
  
  // Test train number (Shatabdi Express)
  const testTrainNumber = '12051';
  const testDate = '20260210'; // Today's date in YYYYMMDD format
  
  try {
    console.log(`1️⃣ Testing Train Search for train ${testTrainNumber}...`);
    const searchResult = await searchTrain(testTrainNumber);
    console.log('✅ Train Search Success!');
    console.log(JSON.stringify(searchResult, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ Train Search Failed:', error.message);
  }
  
  try {
    console.log(`2️⃣ Testing Live Train Status for train ${testTrainNumber} on ${testDate}...`);
    const statusResult = await getLiveTrainStatus(testTrainNumber, testDate);
    console.log('✅ Live Status Success!');
    console.log(JSON.stringify(statusResult, null, 2));
  } catch (error) {
    console.error('❌ Live Status Failed:', error.message);
  }
}

testAPI();
