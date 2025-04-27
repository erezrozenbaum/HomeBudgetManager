const React = window.React;
const { useState } = React;
const { Line, Bar, Pie } = require('react-chartjs-2');
const {
  Chart: ChartJS,
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

function Reports() {
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

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

  const savingsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Savings',
        data: [500, 700, 200, 600, 500, 400],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const handleExport = (format) => {
    // Implement export functionality
    console.log(`Exporting report as ${format}`);
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800' }, 'Reports'),
      React.createElement('div', { className: 'flex space-x-4' },
        React.createElement('select', {
          value: dateRange,
          onChange: (e) => setDateRange(e.target.value),
          className: 'border rounded-lg px-3 py-2'
        },
          React.createElement('option', { value: 'week' }, 'Last Week'),
          React.createElement('option', { value: 'month' }, 'Last Month'),
          React.createElement('option', { value: 'quarter' }, 'Last Quarter'),
          React.createElement('option', { value: 'year' }, 'Last Year')
        ),
        React.createElement('button', {
          onClick: () => handleExport('pdf'),
          className: 'bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
        }, 'Export PDF'),
        React.createElement('button', {
          onClick: () => handleExport('csv'),
          className: 'bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
        }, 'Export CSV')
      )
    ),
    React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
      React.createElement('div', { className: 'border-b border-gray-200' },
        React.createElement('nav', { className: '-mb-px flex space-x-8' },
          ['overview', 'income', 'expenses', 'savings'].map(report => 
            React.createElement('button', {
              key: report,
              onClick: () => setActiveReport(report),
              className: `${
                activeReport === report
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
            }, report.charAt(0).toUpperCase() + report.slice(1))
          )
        )
      ),
      React.createElement('div', { className: 'mt-6' },
        activeReport === 'overview' && React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
            React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
              React.createElement('h3', { className: 'text-lg font-semibold text-gray-700' }, 'Net Balance'),
              React.createElement('p', { className: 'text-3xl font-bold text-gray-900' }, '$5,000.00')
            ),
            React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
              React.createElement('h3', { className: 'text-lg font-semibold text-gray-700' }, 'Total Income'),
              React.createElement('p', { className: 'text-3xl font-bold text-green-600' }, '$4,200.00')
            ),
            React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
              React.createElement('h3', { className: 'text-lg font-semibold text-gray-700' }, 'Total Expenses'),
              React.createElement('p', { className: 'text-3xl font-bold text-red-600' }, '$3,800.00')
            )
          ),
          React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
            React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
              React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Income vs Expenses'),
              React.createElement(Line, { data: incomeExpenseData })
            ),
            React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
              React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Category Breakdown'),
              React.createElement(Pie, { data: categoryData })
            )
          )
        ),
        activeReport === 'income' && React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Income Trends'),
            React.createElement(Line, { data: incomeExpenseData })
          ),
          React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Income Sources'),
            React.createElement(Pie, { data: categoryData })
          )
        ),
        activeReport === 'expenses' && React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Expense Trends'),
            React.createElement(Line, { data: incomeExpenseData })
          ),
          React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Expense Categories'),
            React.createElement(Pie, { data: categoryData })
          )
        ),
        activeReport === 'savings' && React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Savings Trends'),
            React.createElement(Bar, { data: savingsData })
          )
        )
      )
    )
  );
}

module.exports = { Reports }; 