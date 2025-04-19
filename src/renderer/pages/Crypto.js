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
  LightBulbIcon,
  CurrencyDollarIcon
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

const Crypto = () => {
  const { user } = useAuth();
  const [cryptos, setCryptos] = useState([]);
  const [followedCryptos, setFollowedCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetchCryptos();
    fetchFollowedCryptos();
    fetchOpportunities();
  }, []);

  const fetchCryptos = async () => {
    try {
      const response = await api.get('/crypto');
      setCryptos(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cryptocurrencies');
      console.error(err);
    }
  };

  const fetchFollowedCryptos = async () => {
    try {
      const response = await api.get('/crypto/user/followed');
      setFollowedCryptos(response.data);
    } catch (err) {
      console.error('Failed to fetch followed cryptocurrencies:', err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await api.get('/crypto/opportunities');
      setOpportunities(response.data);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    }
  };

  const handleCryptoSelect = async (crypto) => {
    try {
      const response = await api.get(`/crypto/${crypto.symbol}`);
      setSelectedCrypto(response.data);
    } catch (err) {
      console.error('Failed to fetch crypto details:', err);
    }
  };

  const handleFollowCrypto = async (crypto) => {
    try {
      await api.post(`/crypto/${crypto.symbol}/follow`);
      fetchFollowedCryptos();
    } catch (err) {
      console.error('Failed to follow crypto:', err);
    }
  };

  const handleSetAlert = async (crypto, alertData) => {
    try {
      await api.post(`/crypto/${crypto.symbol}/alerts`, alertData);
      handleCryptoSelect(crypto);
    } catch (err) {
      console.error('Failed to set alert:', err);
    }
  };

  const getChartData = () => {
    if (!selectedCrypto?.priceHistory) return null;

    const history = selectedCrypto.priceHistory
      .filter(h => {
        const now = new Date();
        const period = timePeriod === 'day' ? 1 :
                      timePeriod === 'week' ? 7 :
                      timePeriod === 'month' ? 30 :
                      timePeriod === '3month' ? 90 :
                      timePeriod === '6month' ? 180 : 365;
        return h.date >= new Date(now - period * 24 * 60 * 60 * 1000);
      })
      .sort((a, b) => a.date - b.date);

    return {
      labels: history.map(h => format(new Date(h.date), 'MMM d')),
      datasets: [
        {
          label: 'Price',
          data: history.map(h => h.close),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cryptocurrency Market</h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cryptocurrencies..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Crypto List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Cryptocurrencies</h2>
            <div className="space-y-2">
              {cryptos
                .filter(crypto => 
                  crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(crypto => (
                  <div
                    key={crypto.symbol}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedCrypto?.symbol === crypto.symbol ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => handleCryptoSelect(crypto)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{crypto.symbol}</div>
                        <div className="text-sm text-gray-500">{crypto.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${crypto.currentPrice}</div>
                        <div className={`text-sm ${
                          crypto.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {crypto.priceChange24h >= 0 ? '+' : ''}{crypto.priceChange24h}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Crypto Details */}
        <div className="lg:col-span-3">
          {selectedCrypto ? (
            <div className="space-y-6">
              {/* Crypto Header */}
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCrypto.symbol}</h2>
                    <p className="text-gray-500">{selectedCrypto.name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFollowCrypto(selectedCrypto)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <StarIcon className={`h-6 w-6 ${
                        followedCryptos.some(c => c.symbol === selectedCrypto.symbol)
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
                    <div className="text-xl font-bold">${selectedCrypto.currentPrice}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Market Cap</div>
                    <div className="text-xl font-bold">${selectedCrypto.marketCap?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">24h Change</div>
                    <div className={`text-xl font-bold ${
                      selectedCrypto.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedCrypto.priceChange24h >= 0 ? '+' : ''}{selectedCrypto.priceChange24h}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">24h Volume</div>
                    <div className="text-xl font-bold">${selectedCrypto.volume24h?.toLocaleString()}</div>
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
                      <h3 className="text-lg font-medium mb-4">Overview</h3>
                      <p className="text-gray-600">{selectedCrypto.description}</p>
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Rank</div>
                          <div className="font-medium">#{selectedCrypto.rank}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Circulating Supply</div>
                          <div className="font-medium">{selectedCrypto.circulatingSupply?.toLocaleString()} {selectedCrypto.symbol}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Supply</div>
                          <div className="font-medium">{selectedCrypto.totalSupply?.toLocaleString()} {selectedCrypto.symbol}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Max Supply</div>
                          <div className="font-medium">{selectedCrypto.maxSupply?.toLocaleString() || 'N/A'} {selectedCrypto.symbol}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'chart' && (
                    <div>
                      <div className="flex justify-end mb-4">
                        <select
                          value={timePeriod}
                          onChange={(e) => setTimePeriod(e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="day">1 Day</option>
                          <option value="week">1 Week</option>
                          <option value="month">1 Month</option>
                          <option value="3month">3 Months</option>
                          <option value="6month">6 Months</option>
                          <option value="year">1 Year</option>
                        </select>
                      </div>
                      {getChartData() && (
                        <Line
                          data={getChartData()}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: `${selectedCrypto.symbol} Price Chart`
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === 'news' && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Latest News</h3>
                      <div className="space-y-4">
                        {selectedCrypto.news.map((article, index) => (
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
                                selectedCrypto.aiAnalysis.shortTermOutlook === 'bullish' ? 'bg-green-100 text-green-800' :
                                selectedCrypto.aiAnalysis.shortTermOutlook === 'bearish' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {selectedCrypto.aiAnalysis.shortTermOutlook}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Long-term</div>
                              <div className={`mt-1 px-3 py-1 inline-flex text-sm font-medium rounded-full ${
                                selectedCrypto.aiAnalysis.longTermOutlook === 'bullish' ? 'bg-green-100 text-green-800' :
                                selectedCrypto.aiAnalysis.longTermOutlook === 'bearish' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {selectedCrypto.aiAnalysis.longTermOutlook}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Confidence</div>
                              <div className="mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-indigo-600 h-2.5 rounded-full"
                                    style={{ width: `${selectedCrypto.aiAnalysis.confidence}%` }}
                                  ></div>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {selectedCrypto.aiAnalysis.confidence}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <div className="space-y-4">
                            {selectedCrypto.aiAnalysis.recommendations.map((rec, index) => (
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
                          {selectedCrypto.aiAnalysis.keyFactors.map((factor, index) => (
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
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No cryptocurrency selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a cryptocurrency from the list to view details
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
                    onClick={() => handleCryptoSelect(opportunity)}
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

export default Crypto; 