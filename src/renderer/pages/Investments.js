const React = window.React;
const { useState, useEffect } = React;
const Line = window.ChartJS.Line;
const {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} = window.ChartJS;

function Investments() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [investments, setInvestments] = useState({
    stocks: [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        shares: 10,
        avgPrice: 150.00,
        currentPrice: 175.00,
        performance: 16.67
      }
    ],
    crypto: [
      {
        id: 1,
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: 0.5,
        avgPrice: 40000.00,
        currentPrice: 45000.00,
        performance: 12.50
      }
    ],
    realEstate: [
      {
        id: 1,
        name: 'Downtown Apartment',
        value: 500000.00,
        monthlyRent: 2000.00,
        expenses: 500.00,
        roi: 3.60
      }
    ]
  });

  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [100000, 105000, 110000, 115000, 120000, 125000],
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.1
      }
    ]
  };

  function StockCard({ investment }) {
    return React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
      React.createElement('div', { className: 'flex justify-between items-start mb-4' },
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-lg font-semibold' }, investment.symbol),
          React.createElement('p', { className: 'text-sm text-gray-500' }, investment.name)
        ),
        React.createElement('span', {
          className: `text-sm font-medium ${investment.performance >= 0 ? 'text-green-600' : 'text-red-600'}`
        }, `${investment.performance >= 0 ? '+' : ''}${investment.performance}%`)
      ),
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Shares'),
          React.createElement('span', null, investment.shares)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Avg. Price'),
          React.createElement('span', null, `$${investment.avgPrice.toFixed(2)}`)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Current Price'),
          React.createElement('span', null, `$${investment.currentPrice.toFixed(2)}`)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Total Value'),
          React.createElement('span', null, `$${(investment.shares * investment.currentPrice).toFixed(2)}`)
        )
      )
    );
  }

  function CryptoCard({ investment }) {
    return React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
      React.createElement('div', { className: 'flex justify-between items-start mb-4' },
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-lg font-semibold' }, investment.symbol),
          React.createElement('p', { className: 'text-sm text-gray-500' }, investment.name)
        ),
        React.createElement('span', {
          className: `text-sm font-medium ${investment.performance >= 0 ? 'text-green-600' : 'text-red-600'}`
        }, `${investment.performance >= 0 ? '+' : ''}${investment.performance}%`)
      ),
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Amount'),
          React.createElement('span', null, investment.amount)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Avg. Price'),
          React.createElement('span', null, `$${investment.avgPrice.toFixed(2)}`)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Current Price'),
          React.createElement('span', null, `$${investment.currentPrice.toFixed(2)}`)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Total Value'),
          React.createElement('span', null, `$${(investment.amount * investment.currentPrice).toFixed(2)}`)
        )
      )
    );
  }

  function RealEstateCard({ investment }) {
    return React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
      React.createElement('div', { className: 'flex justify-between items-start mb-4' },
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-lg font-semibold' }, investment.name),
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Real Estate')
        ),
        React.createElement('span', {
          className: `text-sm font-medium ${investment.roi >= 0 ? 'text-green-600' : 'text-red-600'}`
        }, `${investment.roi >= 0 ? '+' : ''}${investment.roi}% ROI`)
      ),
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Value'),
          React.createElement('span', null, `$${investment.value.toFixed(2)}`)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Monthly Rent'),
          React.createElement('span', null, `$${investment.monthlyRent.toFixed(2)}`)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Monthly Expenses'),
          React.createElement('span', null, `$${investment.expenses.toFixed(2)}`)
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement('span', { className: 'text-gray-600' }, 'Net Monthly Income'),
          React.createElement('span', null, `$${(investment.monthlyRent - investment.expenses).toFixed(2)}`)
        )
      )
    );
  }

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800' }, 'Investments'),
      React.createElement('button', {
        className: 'bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
      }, 'Add Investment')
    ),
    React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Portfolio Performance'),
      React.createElement(Line, {
        data: performanceData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Portfolio Value Over Time'
            }
          }
        }
      })
    ),
    React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
      React.createElement('div', { className: 'border-b border-gray-200' },
        React.createElement('nav', { className: '-mb-px flex space-x-8' },
          React.createElement('button', {
            onClick: () => setActiveTab('stocks'),
            className: `${activeTab === 'stocks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
          }, 'Stocks'),
          React.createElement('button', {
            onClick: () => setActiveTab('crypto'),
            className: `${activeTab === 'crypto' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
          }, 'Cryptocurrency'),
          React.createElement('button', {
            onClick: () => setActiveTab('realEstate'),
            className: `${activeTab === 'realEstate' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
          }, 'Real Estate')
        )
      ),
      React.createElement('div', { className: 'mt-6' },
        ...investments[activeTab].map(investment => {
          switch (activeTab) {
            case 'stocks':
              return React.createElement(StockCard, { key: investment.id, investment });
            case 'crypto':
              return React.createElement(CryptoCard, { key: investment.id, investment });
            case 'realEstate':
              return React.createElement(RealEstateCard, { key: investment.id, investment });
            default:
              return null;
          }
        })
      )
    )
  );
}

module.exports = { Investments }; 