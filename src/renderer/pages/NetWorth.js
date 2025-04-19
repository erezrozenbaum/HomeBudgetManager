import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const NetWorth = () => {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [newAsset, setNewAsset] = useState({
    name: '',
    value: '',
    type: 'cash',
    notes: ''
  });
  const [newLiability, setNewLiability] = useState({
    name: '',
    amount: '',
    type: 'loan',
    notes: ''
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAssets();
    fetchLiabilities();
    fetchNetWorthHistory();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchLiabilities = async () => {
    try {
      const response = await fetch('/api/liabilities');
      const data = await response.json();
      setLiabilities(data);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
    }
  };

  const fetchNetWorthHistory = async () => {
    try {
      const response = await fetch('/api/net-worth/history');
      const data = await response.json();
      setNetWorthHistory(data);
    } catch (error) {
      console.error('Error fetching net worth history:', error);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAsset),
      });
      if (response.ok) {
        await fetchAssets();
        await fetchNetWorthHistory();
        setNewAsset({
          name: '',
          value: '',
          type: 'cash',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleAddLiability = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/liabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLiability),
      });
      if (response.ok) {
        await fetchLiabilities();
        await fetchNetWorthHistory();
        setNewLiability({
          name: '',
          amount: '',
          type: 'loan',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error adding liability:', error);
    }
  };

  const handleDeleteAsset = async (id) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchAssets();
        await fetchNetWorthHistory();
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleDeleteLiability = async (id) => {
    try {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchLiabilities();
        await fetchNetWorthHistory();
      }
    } catch (error) {
      console.error('Error deleting liability:', error);
    }
  };

  const calculateTotalAssets = () => {
    return assets.reduce((sum, asset) => sum + parseFloat(asset.value), 0);
  };

  const calculateTotalLiabilities = () => {
    return liabilities.reduce((sum, liability) => sum + parseFloat(liability.amount), 0);
  };

  const calculateNetWorth = () => {
    return calculateTotalAssets() - calculateTotalLiabilities();
  };

  const getNetWorthChartData = () => {
    return {
      labels: netWorthHistory.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Net Worth',
          data: netWorthHistory.map(item => item.value),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  const getAssetDistributionData = () => {
    const assetTypes = [...new Set(assets.map(asset => asset.type))];
    return {
      labels: assetTypes,
      datasets: [
        {
          data: assetTypes.map(type => 
            assets
              .filter(asset => asset.type === type)
              .reduce((sum, asset) => sum + parseFloat(asset.value), 0)
          ),
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)'
          ]
        }
      ]
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Net Worth Calculator</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded ${
              activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 rounded ${
              activeTab === 'assets' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('liabilities')}
            className={`px-4 py-2 rounded ${
              activeTab === 'liabilities' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Liabilities
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Total Assets</h2>
              <p className="text-3xl font-bold text-green-600">
                ${calculateTotalAssets().toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Total Liabilities</h2>
              <p className="text-3xl font-bold text-red-600">
                ${calculateTotalLiabilities().toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Net Worth</h2>
              <p className="text-3xl font-bold">
                ${calculateNetWorth().toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Net Worth History</h2>
              <div className="h-64">
                <Line data={getNetWorthChartData()} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Asset Distribution</h2>
              <div className="h-64">
                <Pie data={getAssetDistributionData()} />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'assets' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Asset</h2>
            <form onSubmit={handleAddAsset}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asset Name</label>
                  <input
                    type="text"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Value</label>
                    <input
                      type="number"
                      value={newAsset.value}
                      onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="investments">Investments</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={newAsset.notes}
                    onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{asset.name}</h3>
                    <p className="text-sm text-gray-500">
                      Value: ${parseFloat(asset.value).toLocaleString()} | Type: {asset.type}
                    </p>
                    {asset.notes && (
                      <p className="text-sm text-gray-500 mt-1">Notes: {asset.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Liability</h2>
            <form onSubmit={handleAddLiability}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Liability Name</label>
                  <input
                    type="text"
                    value={newLiability.name}
                    onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={newLiability.amount}
                      onChange={(e) => setNewLiability({ ...newLiability, amount: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={newLiability.type}
                      onChange={(e) => setNewLiability({ ...newLiability, type: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="loan">Loan</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="mortgage">Mortgage</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={newLiability.notes}
                    onChange={(e) => setNewLiability({ ...newLiability, notes: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Liability
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {liabilities.map((liability) => (
              <div key={liability.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{liability.name}</h3>
                    <p className="text-sm text-gray-500">
                      Amount: ${parseFloat(liability.amount).toLocaleString()} | Type: {liability.type}
                    </p>
                    {liability.notes && (
                      <p className="text-sm text-gray-500 mt-1">Notes: {liability.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteLiability(liability.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
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

export default NetWorth; 