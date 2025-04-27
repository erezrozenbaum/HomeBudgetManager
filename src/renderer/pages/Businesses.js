const React = window.React;
const { useState, useEffect } = React;

function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    type: 'sole_proprietorship',
    users: [],
    financials: {
      revenue: '',
      expenses: '',
      profit: '',
      currency: 'USD'
    },
    profile: {
      industry: '',
      location: '',
      founded: new Date().toISOString().split('T')[0],
      website: '',
      description: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/businesses');
      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBusiness),
      });
      const data = await response.json();
      setBusinesses([...businesses, data]);
      setShowModal(false);
      setNewBusiness({
        name: '',
        type: 'sole_proprietorship',
        users: [],
        financials: {
          revenue: '',
          expenses: '',
          profit: '',
          currency: 'USD'
        },
        profile: {
          industry: '',
          location: '',
          founded: new Date().toISOString().split('T')[0],
          website: '',
          description: ''
        },
        notes: ''
      });
    } catch (error) {
      console.error('Error adding business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business?')) return;

    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/businesses/${id}`, {
        method: 'DELETE',
      });
      setBusinesses(businesses.filter(business => business.id !== id));
    } catch (error) {
      console.error('Error deleting business:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sole_proprietorship':
        return 'bg-blue-100 text-blue-800';
      case 'partnership':
        return 'bg-green-100 text-green-800';
      case 'corporation':
        return 'bg-purple-100 text-purple-800';
      case 'llc':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Businesses'),
      React.createElement('button', {
        onClick: () => setShowModal(true),
        className: 'bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600'
      }, 'Add Business')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      businesses.map(business => React.createElement('div', {
        key: business.id,
        className: 'bg-white p-6 rounded-lg shadow'
      },
        React.createElement('div', { className: 'flex justify-between items-start' },
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-lg font-semibold' }, business.name),
            React.createElement('p', { className: 'text-sm text-gray-500' }, business.profile.industry)
          ),
          React.createElement('span', {
            className: `px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(business.type)}`
          }, formatType(business.type))
        ),
        React.createElement('div', { className: 'mt-4' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Location'),
          React.createElement('p', { className: 'font-semibold' }, business.profile.location)
        ),
        React.createElement('div', { className: 'mt-4 grid grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-gray-500' }, 'Revenue'),
            React.createElement('p', { className: 'font-semibold' }, formatCurrency(business.financials.revenue, business.financials.currency))
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-gray-500' }, 'Profit'),
            React.createElement('p', { className: 'font-semibold' }, formatCurrency(business.financials.profit, business.financials.currency))
          )
        ),
        React.createElement('div', { className: 'mt-4' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Founded'),
          React.createElement('p', { className: 'font-semibold' }, formatDate(business.profile.founded))
        ),
        React.createElement('div', { className: 'flex justify-end space-x-2 mt-4' },
          React.createElement('button', {
            onClick: () => handleDeleteBusiness(business.id),
            className: 'text-red-600 hover:text-red-800'
          }, 'Delete')
        )
      ))
    ),
    showModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'bg-white p-6 rounded-lg w-96' },
        React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Add New Business'),
        React.createElement('form', { onSubmit: handleAddBusiness },
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Name'),
              React.createElement('input', {
                type: 'text',
                name: 'name',
                value: newBusiness.name,
                onChange: (e) => setNewBusiness(prev => ({ ...prev, name: e.target.value })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
                required: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Type'),
              React.createElement('select', {
                name: 'type',
                value: newBusiness.type,
                onChange: (e) => setNewBusiness(prev => ({ ...prev, type: e.target.value })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
                required: true
              },
                React.createElement('option', { value: 'sole_proprietorship' }, 'Sole Proprietorship'),
                React.createElement('option', { value: 'partnership' }, 'Partnership'),
                React.createElement('option', { value: 'corporation' }, 'Corporation'),
                React.createElement('option', { value: 'llc' }, 'LLC')
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Industry'),
              React.createElement('input', {
                type: 'text',
                name: 'profile.industry',
                value: newBusiness.profile.industry,
                onChange: (e) => setNewBusiness(prev => ({
                  ...prev,
                  profile: { ...prev.profile, industry: e.target.value }
                })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
                required: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Location'),
              React.createElement('input', {
                type: 'text',
                name: 'profile.location',
                value: newBusiness.profile.location,
                onChange: (e) => setNewBusiness(prev => ({
                  ...prev,
                  profile: { ...prev.profile, location: e.target.value }
                })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
                required: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Revenue'),
              React.createElement('input', {
                type: 'number',
                name: 'financials.revenue',
                value: newBusiness.financials.revenue,
                onChange: (e) => setNewBusiness(prev => ({
                  ...prev,
                  financials: { ...prev.financials, revenue: e.target.value }
                })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
                required: true
              })
            )
          ),
          React.createElement('div', { className: 'flex justify-end space-x-2 mt-6' },
            React.createElement('button', {
              type: 'button',
              onClick: () => setShowModal(false),
              className: 'px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
            }, 'Cancel'),
            React.createElement('button', {
              type: 'submit',
              disabled: loading,
              className: 'px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50'
            }, loading ? 'Adding...' : 'Add Business')
          )
        )
      )
    )
  );
}

module.exports = { Businesses }; 