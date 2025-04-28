const React = window.React;
const { useState, useEffect } = React;
const { useAuth } = require('../context/AuthContext');
const { api } = require('../utils/api');
const { format } = require('date-fns');
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
const { Line } = require('react-chartjs-2');
const {
  SearchIcon,
  StarIcon,
  BellIcon,
  ChartBarIcon,
  NewspaperIcon,
  LightBulbIcon
} = require('@heroicons/react/outline');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Stocks = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [followedStocks, setFollowedStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('1M');
  const [activeTab, setActiveTab] = useState('overview');
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetchStocks();
    fetchFollowedStocks();
    fetchOpportunities();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stocks');
      setStocks(response.data);
    } catch (err) {
      setError('Failed to fetch stocks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedStocks = async () => {
    try {
      const response = await api.get('/stocks/user/followed');
      setFollowedStocks(response.data);
    } catch (err) {
      console.error('Failed to fetch followed stocks:', err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await api.get('/stocks/opportunities');
      setOpportunities(response.data);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    }
  };

  const handleStockSelect = async (stock) => {
    try {
      setLoading(true);
      const [details, history] = await Promise.all([
        api.get(`/stocks/${stock.symbol}`),
        api.get(`/stocks/${stock.symbol}/history?period=${getPeriodInDays(timeframe)}`)
      ]);
      setSelectedStock({
        ...details.data,
        priceHistory: history.data
      });
    } catch (err) {
      setError('Failed to fetch stock details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodInDays = (timeframe) => {
    const periods = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 1825
    };
    return periods[timeframe] || 30;
  };

  const handleFollowStock = async (stock) => {
    try {
      if (followedStocks.some(s => s.symbol === stock.symbol)) {
        await api.delete(`/stocks/${stock.symbol}/follow`);
        setFollowedStocks(prev => prev.filter(s => s.symbol !== stock.symbol));
      } else {
        await api.post(`/stocks/${stock.symbol}/follow`);
        setFollowedStocks(prev => [...prev, stock]);
      }
    } catch (err) {
      console.error('Failed to update stock follow status:', err);
    }
  };

  const handleSetAlert = async (stock, alertData) => {
    try {
      await api.post(`/stocks/${stock.symbol}/alerts`, alertData);
    } catch (err) {
      console.error('Failed to set stock alert:', err);
    }
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800' }, 'Stocks'),
      React.createElement('div', { className: 'flex items-center space-x-4' },
        React.createElement('div', { className: 'relative' },
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search stocks...',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: 'pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          }),
          React.createElement(SearchIcon, {
            className: 'absolute left-3 top-2.5 h-5 w-5 text-gray-400'
          })
        ),
        React.createElement('select', {
          value: timeframe,
          onChange: (e) => setTimeframe(e.target.value),
          className: 'px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        },
          React.createElement('option', { value: '1D' }, '1 Day'),
          React.createElement('option', { value: '1W' }, '1 Week'),
          React.createElement('option', { value: '1M' }, '1 Month'),
          React.createElement('option', { value: '3M' }, '3 Months'),
          React.createElement('option', { value: '6M' }, '6 Months'),
          React.createElement('option', { value: '1Y' }, '1 Year'),
          React.createElement('option', { value: '5Y' }, '5 Years')
        )
      )
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'lg:col-span-2 space-y-6' },
        React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
          React.createElement('div', { className: 'border-b border-gray-200' },
            React.createElement('nav', { className: '-mb-px flex space-x-8' },
              React.createElement('button', {
                onClick: () => setActiveTab('overview'),
                className: `${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
              }, 'Overview'),
              React.createElement('button', {
                onClick: () => setActiveTab('opportunities'),
                className: `${
                  activeTab === 'opportunities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
              }, 'Opportunities')
            )
          ),
          React.createElement('div', { className: 'mt-6' },
            activeTab === 'overview' ? React.createElement('div', { className: 'space-y-4' },
              loading ? React.createElement('div', { className: 'flex justify-center items-center h-64' },
                React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' })
              ) : error ? React.createElement('div', { className: 'text-red-500 text-center' }, error) :
                React.createElement('div', { className: 'space-y-4' },
                  selectedStock && React.createElement('div', { className: 'space-y-4' },
                    React.createElement('div', { className: 'flex justify-between items-center' },
                      React.createElement('div', null,
                        React.createElement('h2', { className: 'text-xl font-bold' }, selectedStock.name),
                        React.createElement('p', { className: 'text-gray-500' }, selectedStock.symbol)
                      ),
                      React.createElement('div', { className: 'flex space-x-2' },
                        React.createElement('button', {
                          onClick: () => handleFollowStock(selectedStock),
                          className: `p-2 rounded-full ${
                            followedStocks.some(s => s.symbol === selectedStock.symbol)
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-400 hover:text-gray-500'
                          }`
                        },
                          React.createElement(StarIcon, { className: 'h-6 w-6' })
                        ),
                        React.createElement('button', {
                          onClick: () => handleSetAlert(selectedStock, { type: 'price', value: selectedStock.price }),
                          className: 'p-2 rounded-full text-gray-400 hover:text-gray-500'
                        },
                          React.createElement(BellIcon, { className: 'h-6 w-6' })
                        )
                      )
                    ),
                    React.createElement('div', { className: 'h-64' },
                      React.createElement(Line, {
                        data: {
                          labels: selectedStock.priceHistory.map(h => format(new Date(h.date), 'MMM d')),
                          datasets: [
                            {
                              label: 'Price',
                              data: selectedStock.priceHistory.map(h => h.price),
                              borderColor: 'rgb(75, 192, 192)',
                              tension: 0.1
                            }
                          ]
                        },
                        options: {
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            }
                          }
                        }
                      })
                    )
                  )
                )
            ) : React.createElement('div', { className: 'space-y-4' },
              opportunities.map(opportunity => React.createElement('div', {
                key: opportunity.id,
                className: 'p-4 border rounded-lg hover:bg-gray-50'
              },
                React.createElement('div', { className: 'flex justify-between items-center' },
                  React.createElement('div', null,
                    React.createElement('h3', { className: 'font-semibold' }, opportunity.stock.name),
                    React.createElement('p', { className: 'text-sm text-gray-500' }, opportunity.stock.symbol)
                  ),
                  React.createElement('span', {
                    className: `px-2 py-1 rounded-full text-sm ${
                      opportunity.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`
                  }, opportunity.type === 'buy' ? 'Buy Opportunity' : 'Sell Opportunity')
                ),
                React.createElement('p', { className: 'mt-2 text-sm' }, opportunity.reason)
              ))
            )
          )
        )
      ),
      React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Followed Stocks'),
          React.createElement('div', { className: 'space-y-2' },
            followedStocks.map(stock => React.createElement('div', {
              key: stock.symbol,
              onClick: () => handleStockSelect(stock),
              className: 'p-3 border rounded-lg hover:bg-gray-50 cursor-pointer'
            },
              React.createElement('div', { className: 'flex justify-between items-center' },
                React.createElement('div', null,
                  React.createElement('p', { className: 'font-medium' }, stock.name),
                  React.createElement('p', { className: 'text-sm text-gray-500' }, stock.symbol)
                ),
                React.createElement('p', { className: 'font-semibold' }, `$${stock.price}`)
              )
            ))
          )
        )
      )
    )
  );
};

module.exports = Stocks; 