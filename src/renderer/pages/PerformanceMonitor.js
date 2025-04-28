const React = window.React;
const { useState, useEffect } = React;
const { Line, Bar } = window['react-chartjs-2'];
const {
  Chart: ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} = window['chart.js'];

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
        const response = await fetch('http://localhost:3000/api/performance/metrics');
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

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Performance Monitoring'),
      React.createElement('div', { className: 'flex space-x-4' },
        React.createElement('select', {
          value: timeRange,
          onChange: (e) => setTimeRange(e.target.value),
          className: 'rounded border-gray-300'
        },
          React.createElement('option', { value: '1h' }, 'Last Hour'),
          React.createElement('option', { value: '6h' }, 'Last 6 Hours'),
          React.createElement('option', { value: '24h' }, 'Last 24 Hours')
        ),
        React.createElement('label', { className: 'flex items-center' },
          React.createElement('input', {
            type: 'checkbox',
            checked: isRealTime,
            onChange: (e) => setIsRealTime(e.target.checked),
            className: 'rounded border-gray-300'
          }),
          React.createElement('span', { className: 'ml-2' }, 'Real-time Updates')
        )
      )
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'bg-white p-4 rounded shadow' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'API Performance'),
        React.createElement(Line, { data: apiCallData })
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded shadow' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Memory Usage'),
        React.createElement(Line, { data: memoryData })
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded shadow' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'CPU Usage'),
        React.createElement(Bar, { data: cpuData })
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded shadow' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Database Queries'),
        React.createElement(Bar, { data: queryData })
      )
    ),
    React.createElement('div', { className: 'mt-6 bg-white p-4 rounded-lg shadow' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Performance Summary'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
        React.createElement('div', { className: 'p-4 bg-blue-50 rounded' },
          React.createElement('h3', { className: 'text-sm text-blue-600' }, 'Average API Response Time'),
          React.createElement('p', { className: 'text-2xl font-bold' },
            metrics.apiCalls.length > 0
              ? (metrics.apiCalls.reduce((acc, curr) => acc + curr.duration, 0) / metrics.apiCalls.length).toFixed(2)
              : 0, ' ms')
        ),
        React.createElement('div', { className: 'p-4 bg-green-50 rounded' },
          React.createElement('h3', { className: 'text-sm text-green-600' }, 'Average Query Time'),
          React.createElement('p', { className: 'text-2xl font-bold' },
            metrics.databaseQueries.length > 0
              ? (metrics.databaseQueries.reduce((acc, curr) => acc + curr.duration, 0) / metrics.databaseQueries.length).toFixed(2)
              : 0, ' ms')
        ),
        React.createElement('div', { className: 'p-4 bg-yellow-50 rounded' },
          React.createElement('h3', { className: 'text-sm text-yellow-600' }, 'Current Memory Usage'),
          React.createElement('p', { className: 'text-2xl font-bold' },
            metrics.memoryUsage.length > 0
              ? (metrics.memoryUsage[metrics.memoryUsage.length - 1].heapUsed / 1024 / 1024).toFixed(2)
              : 0, ' MB')
        ),
        React.createElement('div', { className: 'p-4 bg-red-50 rounded' },
          React.createElement('h3', { className: 'text-sm text-red-600' }, 'Current CPU Usage'),
          React.createElement('p', { className: 'text-2xl font-bold' },
            metrics.cpuUsage.length > 0
              ? ((metrics.cpuUsage[metrics.cpuUsage.length - 1].user + metrics.cpuUsage[metrics.cpuUsage.length - 1].system) / 1000000).toFixed(2)
              : 0, '%')
        )
      )
    )
  );
};

module.exports = { PerformanceMonitor }; 