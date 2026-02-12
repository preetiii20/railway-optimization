// // frontend/src/App.js

// import { useState, useEffect } from 'react';
// import './App.css';

// function App() {
//   const [trains, setTrains] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch trains from backend
//     fetch('http://localhost:5000/api/trains')
//       .then(response => response.json())
//       .then(data => {
//         setTrains(data.data);
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error('Error:', error);
//         setLoading(false);
//       });

//     // WebSocket connection for real-time updates
//     const socket = new WebSocket('ws://localhost:5000');
    
//     socket.onopen = () => {
//       console.log('🔌 Connected to WebSocket');
//     };
    
//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       setTrains(data);
//     };
    
//     socket.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };
    
//     // Cleanup
//     return () => {
//       socket.close();
//     };
//   }, []);

//   if (loading) {
//     return (
//       <div className="App">
//         <h1>🚂 Railway Optimization System</h1>
//         <p>Loading train data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>🚂 Railway Optimization System</h1>
//         <p>Real-time Train Monitoring Dashboard</p>
//       </header>

//       <main>
//         <div className="dashboard">
//           <div className="stats">
//             <div className="stat-card">
//               <h3>Active Trains</h3>
//               <p className="stat-number">{trains.length}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Delayed Trains</h3>
//               <p className="stat-number">
//                 {trains.filter(t => t.delay > 0).length}
//               </p>
//             </div>
//             <div className="stat-card">
//               <h3>Average Delay</h3>
//               <p className="stat-number">
//                 {trains.length > 0 
//                   ? (trains.reduce((sum, t) => sum + t.delay, 0) / trains.length).toFixed(1)
//                   : '0'} min
//               </p>
//             </div>
//           </div>

//           <div className="train-list">
//             <h2>Live Train Status</h2>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Train ID</th>
//                   <th>Name</th>
//                   <th>Type</th>
//                   <th>Status</th>
//                   <th>Delay</th>
//                   <th>Location</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {trains.map(train => (
//                   <tr key={train.id}>
//                     <td>{train.trainId}</td>
//                     <td>{train.name}</td>
//                     <td>{train.type}</td>
//                     <td>
//                       <span className={`status ${train.status}`}>
//                         {train.status}
//                       </span>
//                     </td>
//                     <td className={train.delay > 0 ? 'delayed' : 'ontime'}>
//                       {train.delay} min
//                     </td>
//                     <td>{train.currentLocation}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="map-placeholder">
//             <h2>Railway Network Map</h2>
//             <div className="map">
//               <p>📍 Map will be displayed here</p>
//               <p>Train positions will show here</p>
//               <div className="coordinates">
//                 {trains.map(train => (
//                   <div key={train.id} className="train-marker">
//                     {train.trainId}: ({train.latitude.toFixed(4)}, {train.longitude.toFixed(4)})
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AIFeatures from './pages/AIFeatures';
import SimpleAITest from './components/SimpleAITest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai-features" element={<AIFeatures />} />
        <Route path="/test-ai" element={<SimpleAITest />} />
      </Routes>
    </Router>
  );
}

export default App;