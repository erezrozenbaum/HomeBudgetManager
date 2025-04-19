import React, { useState, useEffect } from 'react';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Credit Cards</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Add Credit Card
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{card.name}</h3>
                  <p className="text-gray-500">{card.type} •••• {card.lastFourDigits}</p>
                </div>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              
              <div className="mt-4 space-y-2">
                <p><span className="font-medium">Issuer:</span> {card.issuer}</p>
                <p><span className="font-medium">Limit:</span> {formatCurrency(card.limit)}</p>
                <p><span className="font-medium">Billing Day:</span> {card.billingDay}</p>
                {card.notes && (
                  <p className="text-gray-600">{card.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Credit Card Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add New Credit Card</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newCard.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  value={newCard.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Discover">Discover</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Issuer</label>
                <input
                  type="text"
                  name="issuer"
                  value={newCard.issuer}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                <input
                  type="number"
                  name="limit"
                  value={newCard.limit}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last 4 Digits</label>
                <input
                  type="text"
                  name="lastFourDigits"
                  value={newCard.lastFourDigits}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  maxLength="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Billing Day</label>
                <input
                  type="number"
                  name="billingDay"
                  value={newCard.billingDay}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  min="1"
                  max="31"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={newCard.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditCards; 