const React = window.React;
const { useState, useEffect } = React;
const { Line } = require('react-chartjs-2');
const ChartJS = require('chart.js').Chart;
const {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} = require('chart.js');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TestCoverage = () => {
  const [coverage, setCoverage] = useState({
    overall: 0,
    statements: 0,
    branches: 0,
    functions: 0,
    lines: 0,
    history: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);

  useEffect(() => {
    fetchCoverage();
  }, []);

  const fetchCoverage = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/coverage');
      const data = await response.json();
      setCoverage(data);
    } catch (error) {
      console.error('Error fetching coverage data:', error);
    }
  };

  const fetchFileDetails = async (filePath) => {
    try {
      const response = await fetch(`/api/coverage/files/${encodeURIComponent(filePath)}`);
      const data = await response.json();
      setFileDetails(data);
    } catch (error) {
      console.error('Error fetching file details:', error);
    }
  };

  const coverageHistoryData = {
    labels: coverage.history.map(h => new Date(h.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Overall Coverage',
        data: coverage.history.map(h => h.overall),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const getCoverageColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Test Coverage Reports'),
      React.createElement('button', {
        onClick: fetchCoverage,
        className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
      }, 'Refresh Data')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6' },
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('h3', { className: 'text-sm text-gray-500' }, 'Overall Coverage'),
        React.createElement('p', {
          className: `text-2xl font-bold ${getCoverageColor(coverage.overall)} p-2 rounded`
        }, `${coverage.overall}%`)
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('h3', { className: 'text-sm text-gray-500' }, 'Statements'),
        React.createElement('p', {
          className: `text-2xl font-bold ${getCoverageColor(coverage.statements)} p-2 rounded`
        }, `${coverage.statements}%`)
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('h3', { className: 'text-sm text-gray-500' }, 'Branches'),
        React.createElement('p', {
          className: `text-2xl font-bold ${getCoverageColor(coverage.branches)} p-2 rounded`
        }, `${coverage.branches}%`)
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('h3', { className: 'text-sm text-gray-500' }, 'Functions'),
        React.createElement('p', {
          className: `text-2xl font-bold ${getCoverageColor(coverage.functions)} p-2 rounded`
        }, `${coverage.functions}%`)
      )
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Coverage History'),
        React.createElement(Line, {
          data: coverageHistoryData,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              },
              title: {
                display: true,
                text: 'Coverage Trend Over Time'
              }
            }
          }
        })
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'File Coverage'),
        React.createElement('div', { className: 'space-y-2' },
          coverage.files?.map(file => React.createElement('div', {
            key: file.path,
            className: 'p-3 border rounded hover:bg-gray-50 cursor-pointer',
            onClick: () => {
              setSelectedFile(file.path);
              fetchFileDetails(file.path);
            }
          },
            React.createElement('div', { className: 'flex justify-between items-center' },
              React.createElement('span', { className: 'text-sm font-medium' }, file.path),
              React.createElement('span', {
                className: `text-sm ${getCoverageColor(file.coverage)} px-2 py-1 rounded`
              }, `${file.coverage}%`)
            )
          ))
        )
      )
    ),
    React.createElement('div', { className: 'mt-6 bg-white p-4 rounded-lg shadow' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'File Details: ', selectedFile),
      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
          React.createElement('thead', { className: 'bg-gray-50' },
            React.createElement('tr', null,
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Line'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Coverage'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Code')
            )
          ),
          React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
            fileDetails && fileDetails.lines.map(line => React.createElement('tr', { key: line.number },
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, line.number),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('span', {
                  className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    line.hits > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`
                }, line.hits > 0 ? 'Covered' : 'Uncovered')
              ),
              React.createElement('td', { className: 'px-6 py-4 text-sm text-gray-500 font-mono' }, line.code)
            ))
          )
        )
      )
    )
  );
};

module.exports = TestCoverage; 