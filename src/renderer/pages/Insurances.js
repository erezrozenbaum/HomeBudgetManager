import React, { useState, useEffect } from 'react';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Insurance Policies</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          Add Policy
        </button>
      </div>

      {/* Insurances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insurances.map((insurance) => (
          <div key={insurance.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{insurance.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{insurance.notes}</p>
              </div>
              <button
                onClick={() => handleDeleteInsurance(insurance.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Provider</p>
              <p className="font-semibold">{insurance.provider}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Premium</p>
                <p className="font-semibold">
                  {formatCurrency(insurance.premiumAmount, insurance.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Frequency</p>
                <p className="font-semibold capitalize">{insurance.paymentFrequency}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Coverage Period</p>
              <p className="font-semibold">
                {formatDate(insurance.startDate)} - {formatDate(insurance.endDate)}
              </p>
            </div>

            <div className="mt-4 flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(insurance.type)}`}>
                {insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(insurance.category)}`}>
                {insurance.category.charAt(0).toUpperCase() + insurance.category.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Insurance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add New Insurance Policy</h2>
            <form onSubmit={handleAddInsurance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newInsurance.name}
                  onChange={(e) => setNewInsurance({ ...newInsurance, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newInsurance.type}
                  onChange={(e) => setNewInsurance({ ...newInsurance, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="health">Health</option>
                  <option value="life">Life</option>
                  <option value="auto">Auto</option>
                  <option value="home">Home</option>
                  <option value="travel">Travel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <input
                  type="text"
                  value={newInsurance.provider}
                  onChange={(e) => setNewInsurance({ ...newInsurance, provider: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Premium Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newInsurance.premiumAmount}
                  onChange={(e) => setNewInsurance({ ...newInsurance, premiumAmount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={newInsurance.currency}
                  onChange={(e) => setNewInsurance({ ...newInsurance, currency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="ILS">ILS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Frequency</label>
                <select
                  value={newInsurance.paymentFrequency}
                  onChange={(e) => setNewInsurance({ ...newInsurance, paymentFrequency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={newInsurance.startDate}
                  onChange={(e) => setNewInsurance({ ...newInsurance, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={newInsurance.endDate}
                  onChange={(e) => setNewInsurance({ ...newInsurance, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newInsurance.category}
                  onChange={(e) => setNewInsurance({ ...newInsurance, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="personal">Personal</option>
                  <option value="family">Family</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={newInsurance.notes}
                  onChange={(e) => setNewInsurance({ ...newInsurance, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600"
                >
                  Add Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
}

export default Insurances; 