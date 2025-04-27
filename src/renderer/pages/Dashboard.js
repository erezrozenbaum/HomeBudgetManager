const React = window.React;
const { useState, useEffect } = React;
const { Line, Bar, Pie } = require('react-chartjs-2');
const ChartJS = require('chart.js').Chart;
const {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} = require('chart.js');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [summaryData, setSummaryData] = useState({
    netBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });

  const incomeExpenseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [3000, 3500, 3200, 3800, 4000, 4200],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
      {
        label: 'Expenses',
        data: [2500, 2800, 3000, 3200, 3500, 3800],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
    ],
  };

  const categoryData = {
    labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Utilities'],
    datasets: [
      {
        data: [30, 25, 15, 20, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center' },
      React.createElement(
        'h1',
        { className: 'text-2xl font-bold text-gray-800' },
        'Dashboard'
      ),
      React.createElement(
        'select',
        {
          value: timeRange,
          onChange: (e) => setTimeRange(e.target.value),
          className: 'px-4 py-2 border rounded-lg'
        },
        React.createElement('option', { value: 'week' }, 'Last Week'),
        React.createElement('option', { value: 'month' }, 'Last Month'),
        React.createElement('option', { value: 'year' }, 'Last Year')
      )
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
      React.createElement(
        'div',
        { className: 'bg-white p-6 rounded-lg shadow' },
        React.createElement(
          'h3',
          { className: 'text-lg font-semibold text-gray-700' },
          'Net Balance'
        ),
        React.createElement(
          'p',
          { className: 'text-3xl font-bold text-gray-900' },
          `$${summaryData.netBalance}`
        )
      ),
      React.createElement(
        'div',
        { className: 'bg-white p-6 rounded-lg shadow' },
        React.createElement(
          'h3',
          { className: 'text-lg font-semibold text-gray-700' },
          'Total Income'
        ),
        React.createElement(
          'p',
          { className: 'text-3xl font-bold text-green-600' },
          `$${summaryData.totalIncome}`
        )
      ),
      React.createElement(
        'div',
        { className: 'bg-white p-6 rounded-lg shadow' },
        React.createElement(
          'h3',
          { className: 'text-lg font-semibold text-gray-700' },
          'Total Expenses'
        ),
        React.createElement(
          'p',
          { className: 'text-3xl font-bold text-red-600' },
          `$${summaryData.totalExpenses}`
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement(
        'div',
        { className: 'bg-white p-6 rounded-lg shadow' },
        React.createElement(
          'h3',
          { className: 'text-lg font-semibold text-gray-700 mb-4' },
          'Income vs Expenses'
        ),
        React.createElement(Line, { data: incomeExpenseData })
      ),
      React.createElement(
        'div',
        { className: 'bg-white p-6 rounded-lg shadow' },
        React.createElement(
          'h3',
          { className: 'text-lg font-semibold text-gray-700 mb-4' },
          'Category Breakdown'
        ),
        React.createElement(Pie, { data: categoryData })
      )
    )
  );
};

module.exports = { Dashboard }; 