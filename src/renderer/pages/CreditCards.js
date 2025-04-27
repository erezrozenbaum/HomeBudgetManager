const React = window.React;
const { useState, useEffect } = React;

function CreditCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    type: 'Visa',
    issuer: '',
    limit: '',
    lastFourDigits: '',
    billingDay: 1,
    linkedBankId: '',
    notes: ''
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/credit-cards');
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching credit cards:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCard(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCard),
      });
      if (response.ok) {
        setShowModal(false);
        setNewCard({
          name: '',
          type: 'Visa',
          issuer: '',
          limit: '',
          lastFourDigits: '',
          billingDay: 1,
          linkedBankId: '',
          notes: ''
        });
        fetchCards();
      }
    } catch (error) {
      console.error('Error adding credit card:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credit card?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/credit-cards/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchCards();
      }
    } catch (error) {
      console.error('Error deleting credit card:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Credit Cards'),
      React.createElement('button', {
        onClick: () => setShowModal(true),
        className: 'bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600'
      }, 'Add Credit Card')
    ),
    loading ? React.createElement('div', { className: 'flex justify-center' },
      React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500' })
    ) : React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      cards.map(card =>
        React.createElement('div', { key: card.id, className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('div', { className: 'flex justify-between items-start' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-xl font-semibold' }, card.name),
              React.createElement('p', { className: 'text-gray-500' }, `${card.type} • ${card.issuer}`)
            ),
            React.createElement('button', {
              onClick: () => handleDelete(card.id),
              className: 'text-red-500 hover:text-red-700'
            }, 'Delete')
          ),
          React.createElement('div', { className: 'mt-4 space-y-2' },
            React.createElement('p', { className: 'text-sm text-gray-500' }, `Last 4 digits: ${card.lastFourDigits}`),
            React.createElement('p', { className: 'text-sm text-gray-500' }, `Credit Limit: ${formatCurrency(card.limit)}`),
            React.createElement('p', { className: 'text-sm text-gray-500' }, `Billing Day: ${card.billingDay}`),
            card.notes && React.createElement('p', { className: 'text-sm text-gray-500' }, `Notes: ${card.notes}`)
          )
        )
      )
    ),
    showModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'bg-white p-6 rounded-lg w-96' },
        React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Add New Credit Card'),
        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Card Name'),
            React.createElement('input', {
              type: 'text',
              name: 'name',
              value: newCard.name,
              onChange: handleInputChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Card Type'),
            React.createElement('select', {
              name: 'type',
              value: newCard.type,
              onChange: handleInputChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
            },
              React.createElement('option', { value: 'Visa' }, 'Visa'),
              React.createElement('option', { value: 'Mastercard' }, 'Mastercard'),
              React.createElement('option', { value: 'American Express' }, 'American Express')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Issuer'),
            React.createElement('input', {
              type: 'text',
              name: 'issuer',
              value: newCard.issuer,
              onChange: handleInputChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Credit Limit'),
            React.createElement('input', {
              type: 'number',
              name: 'limit',
              value: newCard.limit,
              onChange: handleInputChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Last 4 Digits'),
            React.createElement('input', {
              type: 'text',
              name: 'lastFourDigits',
              value: newCard.lastFourDigits,
              onChange: handleInputChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true,
              maxLength: 4
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Billing Day'),
            React.createElement('input', {
              type: 'number',
              name: 'billingDay',
              value: newCard.billingDay,
              onChange: handleInputChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true,
              min: 1,
              max: 31
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Notes'),
            React.createElement('textarea', {
              name: 'notes',
              value: newCard.notes,
              onChange: handleInputChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              rows: 3
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
              className: 'px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600'
            }, 'Add Card')
          )
        )
      )
    )
  );
}

module.exports = CreditCards; 