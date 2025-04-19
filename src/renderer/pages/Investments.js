import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  const StockCard = ({ investment }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{investment.symbol}</h3>
          <p className="text-sm text-gray-500">{investment.name}</p>
        </div>
        <span className={`text-sm font-medium ${
          investment.performance >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {investment.performance >= 0 ? '+' : ''}{investment.performance}%
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Shares</span>
          <span>{investment.shares}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg. Price</span>
          <span>${investment.avgPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Price</span>
          <span>${investment.currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Value</span>
          <span className="font-medium">
            ${(investment.shares * investment.currentPrice).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  const CryptoCard = ({ investment }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{investment.symbol}</h3>
          <p className="text-sm text-gray-500">{investment.name}</p>
        </div>
        <span className={`text-sm font-medium ${
          investment.performance >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {investment.performance >= 0 ? '+' : ''}{investment.performance}%
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Amount</span>
          <span>{investment.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg. Price</span>
          <span>${investment.avgPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Price</span>
          <span>${investment.currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Value</span>
          <span className="font-medium">
            ${(investment.amount * investment.currentPrice).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  const RealEstateCard = ({ investment }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{investment.name}</h3>
          <p className="text-sm text-gray-500">Real Estate</p>
        </div>
        <span className="text-sm font-medium text-green-600">
          {investment.roi}% ROI
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Property Value</span>
          <span>${investment.value.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Rent</span>
          <span>${investment.monthlyRent.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Expenses</span>
          <span>${investment.expenses.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Net</span>
          <span className="font-medium text-green-600">
            ${(investment.monthlyRent - investment.expenses).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Investments</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Add Investment
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Portfolio Performance</h2>
        <div className="h-64">
          <Line data={performanceData} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('stocks')}
              className={`${
                activeTab === 'stocks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Stocks
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`${
                activeTab === 'crypto'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Crypto
            </button>
            <button
              onClick={() => setActiveTab('realEstate')}
              className={`${
                activeTab === 'realEstate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Real Estate
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'stocks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.stocks.map((investment) => (
                <StockCard key={investment.id} investment={investment} />
              ))}
            </div>
          )}
          {activeTab === 'crypto' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.crypto.map((investment) => (
                <CryptoCard key={investment.id} investment={investment} />
              ))}
            </div>
          )}
          {activeTab === 'realEstate' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.realEstate.map((investment) => (
                <RealEstateCard key={investment.id} investment={investment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Investments; 