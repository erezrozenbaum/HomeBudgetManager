import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  SearchIcon,
  StarIcon,
  BellIcon,
  ChartBarIcon,
  NewspaperIcon,
  LightBulbIcon
} from '@heroicons/react/outline';

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
    switch (timeframe) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 30;
    }
  };

  const handleFollowStock = async (stock) => {
    try {
      await api.post(`/stocks/${stock.symbol}/follow`);
      fetchFollowedStocks();
    } catch (err) {
      console.error('Failed to follow stock:', err);
    }
  };

  const handleSetAlert = async (stock, alertData) => {
    try {
      await api.post(`/stocks/${stock.symbol}/alerts`, alertData);
      // Refresh stock data
      handleStockSelect(stock);
    } catch (err) {
      console.error('Failed to set alert:', err);
    }
  };

  const chartData = selectedStock ? {
    labels: selectedStock.priceHistory.map(data => format(new Date(data.date), 'MMM d')),
    datasets: [
      {
        label: 'Price',
        data: selectedStock.priceHistory.map(data => data.close),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price History'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  if (loading && !selectedStock) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Market</h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stock List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Stocks</h2>
            <div className="space-y-2">
              {stocks
                .filter(stock => 
                  stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  stock.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(stock => (
                  <div
                    key={stock.symbol}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedStock?.symbol === stock.symbol ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => handleStockSelect(stock)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${stock.currentPrice}</div>
                        <div className="text-sm text-gray-500">{stock.sector}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Stock Details */}
        <div className="lg:col-span-3">
          {selectedStock ? (
            <div className="space-y-6">
              {/* Stock Header */}
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStock.symbol}</h2>
                    <p className="text-gray-500">{selectedStock.name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFollowStock(selectedStock)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <StarIcon className={`h-6 w-6 ${
                        followedStocks.some(s => s.symbol === selectedStock.symbol)
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`} />
                    </button>
                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <BellIcon className="h-6 w-6 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Current Price</div>
                    <div className="text-xl font-bold">${selectedStock.currentPrice}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Market Cap</div>
                    <div className="text-xl font-bold">${selectedStock.marketCap?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">P/E Ratio</div>
                    <div className="text-xl font-bold">{selectedStock.peRatio}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Dividend Yield</div>
                    <div className="text-xl font-bold">{selectedStock.dividendYield}%</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`py-4 px-6 text-sm font-medium ${
                        activeTab === 'overview'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('chart')}
                      className={`py-4 px-6 text-sm font-medium ${
                        activeTab === 'chart'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Chart
                    </button>
                    <button
                      onClick={() => setActiveTab('news')}
                      className={`py-4 px-6 text-sm font-medium ${
                        activeTab === 'news'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      News
                    </button>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`py-4 px-6 text-sm font-medium ${
                        activeTab === 'analysis'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      AI Analysis
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Company Overview</h3>
                      <p className="text-gray-600">{selectedStock.description}</p>
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Sector</div>
                          <div className="font-medium">{selectedStock.sector}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Industry</div>
                          <div className="font-medium">{selectedStock.industry}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Exchange</div>
                          <div className="font-medium">{selectedStock.exchange}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Website</div>
                          <a
                            href={selectedStock.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            {selectedStock.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'chart' && (
                    <div>
                      <div className="flex justify-end space-x-2 mb-4">
                        {['1D', '1W', '1M', '3M', '6M', '1Y'].map((tf) => (
                          <button
                            key={tf}
                            className={`px-3 py-1 rounded ${
                              timeframe === tf
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                            onClick={() => setTimeframe(tf)}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                      {chartData && <Line data={chartData} options={chartOptions} />}
                    </div>
                  )}

                  {activeTab === 'news' && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Latest News</h3>
                      <div className="space-y-4">
                        {selectedStock.news.map((article, index) => (
                          <div key={index} className="border-b border-gray-200 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-lg font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                  {article.title}
                                </a>
                                <p className="mt-1 text-sm text-gray-500">
                                  {format(new Date(article.date), 'PPp')} • {article.source}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                article.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                article.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {article.sentiment}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-600">{article.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">AI Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Outlook</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-gray-500">Short-term</div>
                              <div className={`mt-1 px-3 py-1 inline-flex text-sm font-medium rounded-full ${
                                selectedStock.aiAnalysis.shortTermOutlook === 'bullish' ? 'bg-green-100 text-green-800' :
                                selectedStock.aiAnalysis.shortTermOutlook === 'bearish' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {selectedStock.aiAnalysis.shortTermOutlook}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Long-term</div>
                              <div className={`mt-1 px-3 py-1 inline-flex text-sm font-medium rounded-full ${
                                selectedStock.aiAnalysis.longTermOutlook === 'bullish' ? 'bg-green-100 text-green-800' :
                                selectedStock.aiAnalysis.longTermOutlook === 'bearish' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {selectedStock.aiAnalysis.longTermOutlook}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Confidence</div>
                              <div className="mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-indigo-600 h-2.5 rounded-full"
                                    style={{ width: `${selectedStock.aiAnalysis.confidence}%` }}
                                  ></div>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {selectedStock.aiAnalysis.confidence}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <div className="space-y-4">
                            {selectedStock.aiAnalysis.recommendations.map((rec, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div className={`px-2 py-1 text-sm font-medium rounded-full ${
                                    rec.type === 'buy' ? 'bg-green-100 text-green-800' :
                                    rec.type === 'sell' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {rec.type.toUpperCase()}
                                  </div>
                                  <div className="text-sm text-gray-500">{rec.timeframe}</div>
                                </div>
                                <div className="mt-2">
                                  <div className="text-sm text-gray-600">{rec.reason}</div>
                                  <div className="mt-1 text-sm font-medium">
                                    Target Price: ${rec.targetPrice}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Key Factors</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {selectedStock.aiAnalysis.keyFactors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stock selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a stock from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Investment Opportunities */}
      {opportunities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Investment Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opportunity, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{opportunity.symbol}</h3>
                    <p className="text-sm text-gray-500">{opportunity.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium">${opportunity.currentPrice}</div>
                    <div className={`text-sm ${
                      opportunity.aiAnalysis.shortTermOutlook === 'bullish' ? 'text-green-600' :
                      opportunity.aiAnalysis.shortTermOutlook === 'bearish' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {opportunity.aiAnalysis.shortTermOutlook}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  {opportunity.alerts.map((alert, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      <BellIcon className="h-4 w-4 inline-block mr-1" />
                      {alert.message}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleStockSelect(opportunity)}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks; 