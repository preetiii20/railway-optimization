import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getTrains } from '../services/api';
import KPICard from './KPICard';

const socket = io('http://localhost:5000');

const Dashboard = () => {
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    // Initial fetch
    getTrains()
      .then(res => setTrains(res.data.data))
      .catch(err => console.error('Error fetching trains:', err));

    // WebSocket listener
    socket.on('trainUpdate', (updatedTrains) => {
      setTrains(updatedTrains);
    });

    return () => socket.off('trainUpdate');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🚂 Railway Control Center</h1>
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard title="Total Trains" value={trains.length} color="border-blue-500" />
        <KPICard title="Delayed" value={trains.filter(t => t.delay > 0).length} color="border-red-500" />
        <KPICard title="System Status" value="Active" color="border-green-500" />
      </div>

      {/* Train Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Train ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Coordinates</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {trains.map((train) => (
              <tr key={train._id} className="border-b border-gray-200">
                <td className="px-5 py-5 text-sm font-bold">{train.trainId}</td>
                <td className="px-5 py-5 text-sm">{train.name}</td>
                <td className="px-5 py-5 text-sm font-mono text-blue-600">
                  {train.latitude.toFixed(4)}, {train.longitude.toFixed(4)}
                </td>
                <td className="px-5 py-5 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${train.delay > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {train.status} {train.delay > 0 ? `(+${train.delay}m)` : ''}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
