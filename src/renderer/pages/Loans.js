const React = window.React;
const { useState, useEffect } = React;

function Loans() {
  const [loans, setLoans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newLoan, setNewLoan] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    interestRate: '',
    monthlyPayment: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    source: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/loans');
      const data = await response.json();
      setLoans(data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLoan),
      });
      const data = await response.json();
      setLoans([...loans, data]);
      setShowModal(false);
      setNewLoan({
        name: '',
        amount: '',
        currency: 'USD',
        interestRate: '',
        monthlyPayment: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: '',
        status: 'active',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;

    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/loans/${id}`, {
        method: 'DELETE',
      });
      setLoans(loans.filter(loan => loan.id !== id));
    } catch (error) {
      console.error('Error deleting loan:', error);
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

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  const calculateRemainingMonths = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = Math.abs(end - now);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'defaulted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Loans'),
      React.createElement('button', {
        onClick: () => setShowModal(true),
        className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
      }, 'Add Loan')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      loans.map(loan => React.createElement('div', {
        key: loan.id,
        className: 'bg-white p-6 rounded-lg shadow'
      },
        React.createElement('div', { className: 'flex justify-between items-start mb-4' },
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-lg font-semibold' }, loan.name),
            React.createElement('p', { className: 'text-sm text-gray-500' }, loan.source)
          ),
          React.createElement('span', {
            className: `px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`
          }, loan.status)
        ),
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-gray-600' }, 'Amount'),
            React.createElement('span', null, formatCurrency(loan.amount, loan.currency))
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-gray-600' }, 'Interest Rate'),
            React.createElement('span', null, formatPercentage(loan.interestRate))
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-gray-600' }, 'Monthly Payment'),
            React.createElement('span', null, formatCurrency(loan.monthlyPayment, loan.currency))
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-gray-600' }, 'Start Date'),
            React.createElement('span', null, formatDate(loan.startDate))
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-gray-600' }, 'End Date'),
            React.createElement('span', null, formatDate(loan.endDate))
          )
        ),
        React.createElement('div', { className: 'flex justify-end space-x-2 mt-4' },
          React.createElement('button', {
            onClick: () => handleDeleteLoan(loan.id),
            className: 'text-red-600 hover:text-red-800'
          }, 'Delete')
        )
      ))
    ),
    showModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'bg-white p-6 rounded-lg w-full max-w-md' },
        React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Add New Loan'),
        React.createElement('form', { onSubmit: handleAddLoan },
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Name'),
              React.createElement('input', {
                type: 'text',
                name: 'name',
                value: newLoan.name,
                onChange: (e) => setNewLoan(prev => ({ ...prev, name: e.target.value })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Amount'),
              React.createElement('input', {
                type: 'number',
                name: 'amount',
                value: newLoan.amount,
                onChange: (e) => setNewLoan(prev => ({ ...prev, amount: e.target.value })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Interest Rate'),
              React.createElement('input', {
                type: 'number',
                name: 'interestRate',
                value: newLoan.interestRate,
                onChange: (e) => setNewLoan(prev => ({ ...prev, interestRate: e.target.value })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Monthly Payment'),
              React.createElement('input', {
                type: 'number',
                name: 'monthlyPayment',
                value: newLoan.monthlyPayment,
                onChange: (e) => setNewLoan(prev => ({ ...prev, monthlyPayment: e.target.value })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Source'),
              React.createElement('input', {
                type: 'text',
                name: 'source',
                value: newLoan.source,
                onChange: (e) => setNewLoan(prev => ({ ...prev, source: e.target.value })),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
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
              className: 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50'
            }, loading ? 'Adding...' : 'Add Loan')
          )
        )
      )
    )
  );
}

module.exports = { Loans }; 