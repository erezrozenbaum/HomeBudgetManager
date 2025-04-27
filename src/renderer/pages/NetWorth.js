const React = window.React;
const { useState, useEffect } = React;
const { Line, Pie } = require('react-chartjs-2');
const {
  Chart: ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function NetWorth() {
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

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Net Worth'),
      React.createElement('div', { className: 'flex space-x-4' },
        ['overview', 'assets', 'liabilities'].map(tab =>
          React.createElement('button', {
            key: tab,
            onClick: () => setActiveTab(tab),
            className: `px-4 py-2 rounded ${
              activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`
          }, tab.charAt(0).toUpperCase() + tab.slice(1))
        )
      )
    ),
    activeTab === 'overview' && React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-700' }, 'Net Worth'),
          React.createElement('p', {
            className: `text-3xl font-bold ${calculateNetWorth() >= 0 ? 'text-green-600' : 'text-red-600'}`
          }, `$${calculateNetWorth().toLocaleString()}`)
        ),
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-700' }, 'Total Assets'),
          React.createElement('p', { className: 'text-3xl font-bold text-green-600' },
            `$${calculateTotalAssets().toLocaleString()}`
          )
        ),
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-700' }, 'Total Liabilities'),
          React.createElement('p', { className: 'text-3xl font-bold text-red-600' },
            `$${calculateTotalLiabilities().toLocaleString()}`
          )
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Net Worth History'),
          React.createElement(Line, { data: getNetWorthChartData() })
        ),
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Asset Distribution'),
          React.createElement(Pie, { data: getAssetDistributionData() })
        )
      )
    ),
    activeTab === 'assets' && React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Add Asset'),
        React.createElement('form', { onSubmit: handleAddAsset, className: 'space-y-4' },
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Name'),
              React.createElement('input', {
                type: 'text',
                value: newAsset.name,
                onChange: (e) => setNewAsset({ ...newAsset, name: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3',
                required: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Value'),
              React.createElement('input', {
                type: 'number',
                value: newAsset.value,
                onChange: (e) => setNewAsset({ ...newAsset, value: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3',
                required: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Type'),
              React.createElement('select', {
                value: newAsset.type,
                onChange: (e) => setNewAsset({ ...newAsset, type: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3'
              },
                ['cash', 'investment', 'property', 'vehicle', 'other'].map(type =>
                  React.createElement('option', { key: type, value: type },
                    type.charAt(0).toUpperCase() + type.slice(1)
                  )
                )
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Notes'),
              React.createElement('textarea', {
                value: newAsset.notes,
                onChange: (e) => setNewAsset({ ...newAsset, notes: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3'
              })
            )
          ),
          React.createElement('div', { className: 'flex justify-end' },
            React.createElement('button', {
              type: 'submit',
              className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
            }, 'Add Asset')
          )
        )
      ),
      React.createElement('div', { className: 'bg-white rounded-lg shadow' },
        React.createElement('div', { className: 'p-4 border-b' },
          React.createElement('h2', { className: 'text-lg font-semibold' }, 'Assets')
        ),
        React.createElement('div', { className: 'divide-y' },
          assets.map(asset =>
            React.createElement('div', {
              key: asset.id,
              className: 'p-4 flex justify-between items-center'
            },
              React.createElement('div', null,
                React.createElement('h3', { className: 'font-medium' }, asset.name),
                React.createElement('p', { className: 'text-sm text-gray-500' },
                  `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} • ${asset.notes}`
                )
              ),
              React.createElement('div', { className: 'flex items-center space-x-4' },
                React.createElement('span', { className: 'font-semibold' },
                  `$${parseFloat(asset.value).toLocaleString()}`
                ),
                React.createElement('button', {
                  onClick: () => handleDeleteAsset(asset.id),
                  className: 'text-red-600 hover:text-red-800'
                }, 'Delete')
              )
            )
          )
        )
      )
    ),
    activeTab === 'liabilities' && React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Add Liability'),
        React.createElement('form', { onSubmit: handleAddLiability, className: 'space-y-4' },
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Name'),
              React.createElement('input', {
                type: 'text',
                value: newLiability.name,
                onChange: (e) => setNewLiability({ ...newLiability, name: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3',
                required: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Amount'),
              React.createElement('input', {
                type: 'number',
                value: newLiability.amount,
                onChange: (e) => setNewLiability({ ...newLiability, amount: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3',
                required: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Type'),
              React.createElement('select', {
                value: newLiability.type,
                onChange: (e) => setNewLiability({ ...newLiability, type: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3'
              },
                ['loan', 'credit_card', 'mortgage', 'other'].map(type =>
                  React.createElement('option', { key: type, value: type },
                    type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                  )
                )
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Notes'),
              React.createElement('textarea', {
                value: newLiability.notes,
                onChange: (e) => setNewLiability({ ...newLiability, notes: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3'
              })
            )
          ),
          React.createElement('div', { className: 'flex justify-end' },
            React.createElement('button', {
              type: 'submit',
              className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
            }, 'Add Liability')
          )
        )
      ),
      React.createElement('div', { className: 'bg-white rounded-lg shadow' },
        React.createElement('div', { className: 'p-4 border-b' },
          React.createElement('h2', { className: 'text-lg font-semibold' }, 'Liabilities')
        ),
        React.createElement('div', { className: 'divide-y' },
          liabilities.map(liability =>
            React.createElement('div', {
              key: liability.id,
              className: 'p-4 flex justify-between items-center'
            },
              React.createElement('div', null,
                React.createElement('h3', { className: 'font-medium' }, liability.name),
                React.createElement('p', { className: 'text-sm text-gray-500' },
                  `${liability.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} • ${liability.notes}`
                )
              ),
              React.createElement('div', { className: 'flex items-center space-x-4' },
                React.createElement('span', { className: 'font-semibold' },
                  `$${parseFloat(liability.amount).toLocaleString()}`
                ),
                React.createElement('button', {
                  onClick: () => handleDeleteLiability(liability.id),
                  className: 'text-red-600 hover:text-red-800'
                }, 'Delete')
              )
            )
          )
        )
      )
    )
  );
}

module.exports = { NetWorth }; 