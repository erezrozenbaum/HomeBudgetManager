import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    apiCalls: [],
    databaseQueries: [],
    memoryUsage: [],
    cpuUsage: []
  });
  const [timeRange, setTimeRange] = useState('1h');
  const [isRealTime, setIsRealTime] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/performance/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    if (isRealTime) {
      const interval = setInterval(fetchMetrics, 5000);
      return () => clearInterval(interval);
    } else {
      fetchMetrics();
    }
  }, [isRealTime, timeRange]);

  const apiCallData = {
    labels: metrics.apiCalls.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'API Call Duration (ms)',
      data: metrics.apiCalls.map(m => m.duration),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const memoryData = {
    labels: metrics.memoryUsage.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Heap Used (MB)',
      data: metrics.memoryUsage.map(m => m.heapUsed / 1024 / 1024),
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }]
  };

  const cpuData = {
    labels: metrics.cpuUsage.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'CPU Usage (%)',
      data: metrics.cpuUsage.map(m => (m.user + m.system) / 1000000),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  const queryData = {
    labels: metrics.databaseQueries.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Query Duration (ms)',
      data: metrics.databaseQueries.map(m => m.duration),
      backgroundColor: 'rgba(255, 206, 86, 0.5)',
    }]
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Performance Monitoring</h1>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isRealTime}
              onChange={(e) => setIsRealTime(e.target.checked)}
              className="form-checkbox"
            />
            <span>Real-time Updates</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">API Performance</h2>
          <Line data={apiCallData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Memory Usage</h2>
          <Line data={memoryData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">CPU Usage</h2>
          <Bar data={cpuData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Database Queries</h2>
          <Bar data={queryData} />
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="text-sm text-blue-600">Average API Response Time</h3>
            <p className="text-2xl font-bold">
              {metrics.apiCalls.length > 0
                ? (metrics.apiCalls.reduce((acc, curr) => acc + curr.duration, 0) / metrics.apiCalls.length).toFixed(2)
                : 0} ms
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <h3 className="text-sm text-green-600">Average Query Time</h3>
            <p className="text-2xl font-bold">
              {metrics.databaseQueries.length > 0
                ? (metrics.databaseQueries.reduce((acc, curr) => acc + curr.duration, 0) / metrics.databaseQueries.length).toFixed(2)
                : 0} ms
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <h3 className="text-sm text-yellow-600">Current Memory Usage</h3>
            <p className="text-2xl font-bold">
              {metrics.memoryUsage.length > 0
                ? (metrics.memoryUsage[metrics.memoryUsage.length - 1].heapUsed / 1024 / 1024).toFixed(2)
                : 0} MB
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded">
            <h3 className="text-sm text-red-600">Current CPU Usage</h3>
            <p className="text-2xl font-bold">
              {metrics.cpuUsage.length > 0
                ? ((metrics.cpuUsage[metrics.cpuUsage.length - 1].user + metrics.cpuUsage[metrics.cpuUsage.length - 1].system) / 1000000).toFixed(2)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor; 