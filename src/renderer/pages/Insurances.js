const React = window.React;
const { useState, useEffect } = React;

function Insurances() {
  const [insurances, setInsurances] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newInsurance, setNewInsurance] = useState({
    name: '',
    type: 'health',
    provider: '',
    premiumAmount: '',
    currency: 'USD',
    paymentFrequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'personal',
    notes: ''
  });

  useEffect(() => {
    fetchInsurances();
  }, []);

  const fetchInsurances = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/insurances');
      const data = await response.json();
      setInsurances(data);
    } catch (error) {
      console.error('Error fetching insurances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInsurance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/insurances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInsurance),
      });
      const data = await response.json();
      setInsurances([...insurances, data]);
      setShowModal(false);
      setNewInsurance({
        name: '',
        type: 'health',
        provider: '',
        premiumAmount: '',
        currency: 'USD',
        paymentFrequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'personal',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding insurance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInsurance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this insurance policy?')) return;

    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/insurances/${id}`, {
        method: 'DELETE',
      });
      setInsurances(insurances.filter(insurance => insurance.id !== id));
    } catch (error) {
      console.error('Error deleting insurance:', error);
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
      case 'health':
        return 'bg-blue-100 text-blue-800';
      case 'life':
        return 'bg-green-100 text-green-800';
      case 'auto':
        return 'bg-yellow-100 text-yellow-800';
      case 'home':
        return 'bg-purple-100 text-purple-800';
      case 'travel':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'personal':
        return 'bg-indigo-100 text-indigo-800';
      case 'family':
        return 'bg-teal-100 text-teal-800';
      case 'business':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-3xl font-bold' }, 'Insurance Policies'),
      React.createElement('button', {
        onClick: () => setShowModal(true),
        className: 'bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600'
      }, 'Add Policy')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      insurances.map(insurance => React.createElement('div', {
        key: insurance.id,
        className: 'bg-white rounded-lg shadow p-6'
      },
        React.createElement('div', { className: 'flex justify-between items-start' },
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-lg font-semibold' }, insurance.name),
            React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, insurance.notes)
          ),
          React.createElement('button', {
            onClick: () => handleDeleteInsurance(insurance.id),
            className: 'text-red-500 hover:text-red-700'
          }, 'Delete')
        ),
        React.createElement('div', { className: 'mt-4' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Provider'),
          React.createElement('p', { className: 'font-semibold' }, insurance.provider)
        ),
        React.createElement('div', { className: 'mt-4 grid grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-gray-500' }, 'Premium'),
            React.createElement('p', { className: 'font-semibold' }, formatCurrency(insurance.premiumAmount, insurance.currency))
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-gray-500' }, 'Frequency'),
            React.createElement('p', { className: 'font-semibold capitalize' }, insurance.paymentFrequency)
          )
        ),
        React.createElement('div', { className: 'mt-4' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Coverage Period'),
          React.createElement('p', { className: 'font-semibold' }, `${formatDate(insurance.startDate)} - ${formatDate(insurance.endDate)}`)
        ),
        React.createElement('div', { className: 'mt-4 flex space-x-2' },
          React.createElement('span', {
            className: `px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(insurance.type)}`
          }, insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1)),
          React.createElement('span', {
            className: `px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(insurance.category)}`
          }, insurance.category.charAt(0).toUpperCase() + insurance.category.slice(1))
        )
      ))
    ),
    showModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'bg-white p-6 rounded-lg w-96' },
        React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Add New Insurance Policy'),
        React.createElement('form', { onSubmit: handleAddInsurance, className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Name'),
            React.createElement('input', {
              type: 'text',
              value: newInsurance.name,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, name: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Type'),
            React.createElement('select', {
              value: newInsurance.type,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, type: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            },
              React.createElement('option', { value: 'health' }, 'Health'),
              React.createElement('option', { value: 'life' }, 'Life'),
              React.createElement('option', { value: 'auto' }, 'Auto'),
              React.createElement('option', { value: 'home' }, 'Home'),
              React.createElement('option', { value: 'travel' }, 'Travel')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Provider'),
            React.createElement('input', {
              type: 'text',
              value: newInsurance.provider,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, provider: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Premium Amount'),
            React.createElement('input', {
              type: 'number',
              step: '0.01',
              value: newInsurance.premiumAmount,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, premiumAmount: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Currency'),
            React.createElement('select', {
              value: newInsurance.currency,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, currency: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            },
              React.createElement('option', { value: 'USD' }, 'USD'),
              React.createElement('option', { value: 'EUR' }, 'EUR'),
              React.createElement('option', { value: 'GBP' }, 'GBP'),
              React.createElement('option', { value: 'JPY' }, 'JPY'),
              React.createElement('option', { value: 'ILS' }, 'ILS')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Payment Frequency'),
            React.createElement('select', {
              value: newInsurance.paymentFrequency,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, paymentFrequency: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            },
              React.createElement('option', { value: 'monthly' }, 'Monthly'),
              React.createElement('option', { value: 'quarterly' }, 'Quarterly'),
              React.createElement('option', { value: 'semi-annual' }, 'Semi-Annual'),
              React.createElement('option', { value: 'annual' }, 'Annual')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Start Date'),
            React.createElement('input', {
              type: 'date',
              value: newInsurance.startDate,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, startDate: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'End Date'),
            React.createElement('input', {
              type: 'date',
              value: newInsurance.endDate,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, endDate: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Category'),
            React.createElement('select', {
              value: newInsurance.category,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, category: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            },
              React.createElement('option', { value: 'personal' }, 'Personal'),
              React.createElement('option', { value: 'family' }, 'Family'),
              React.createElement('option', { value: 'business' }, 'Business')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Notes'),
            React.createElement('textarea', {
              value: newInsurance.notes,
              onChange: (e) => setNewInsurance(prev => ({ ...prev, notes: e.target.value })),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              rows: '3'
            })
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3' },
            React.createElement('button', {
              type: 'button',
              onClick: () => setShowModal(false),
              className: 'px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'
            }, 'Cancel'),
            React.createElement('button', {
              type: 'submit',
              disabled: loading,
              className: 'px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50'
            }, loading ? 'Adding...' : 'Add Policy')
          )
        )
      )
    ),
    loading && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500' })
    )
  );
}

module.exports = { Insurances }; 