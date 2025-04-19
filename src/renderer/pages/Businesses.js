import React, { useState, useEffect } from 'react';

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
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Businesses</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          Add Business
        </button>
      </div>

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <div key={business.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{business.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{business.profile.description}</p>
              </div>
              <button
                onClick={() => handleDeleteBusiness(business.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Industry</p>
              <p className="font-semibold">{business.profile.industry}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="font-semibold">
                  {formatCurrency(business.financials.revenue, business.financials.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Profit</p>
                <p className="font-semibold">
                  {formatCurrency(business.financials.profit, business.financials.currency)}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold">{business.profile.location}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Founded</p>
              <p className="font-semibold">{formatDate(business.profile.founded)}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Users</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {business.users.map((user, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                    {user}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(business.type)}`}>
                {formatType(business.type)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Business Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add New Business</h2>
            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newBusiness.name}
                  onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newBusiness.type}
                  onChange={(e) => setNewBusiness({ ...newBusiness, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="corporation">Corporation</option>
                  <option value="llc">LLC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <input
                  type="text"
                  value={newBusiness.profile.industry}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    profile: { ...newBusiness.profile, industry: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={newBusiness.profile.location}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    profile: { ...newBusiness.profile, location: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Founded Date</label>
                <input
                  type="date"
                  value={newBusiness.profile.founded}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    profile: { ...newBusiness.profile, founded: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  value={newBusiness.profile.website}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    profile: { ...newBusiness.profile, website: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Revenue</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBusiness.financials.revenue}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    financials: { ...newBusiness.financials, revenue: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expenses</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBusiness.financials.expenses}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    financials: { ...newBusiness.financials, expenses: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={newBusiness.financials.currency}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    financials: { ...newBusiness.financials, currency: e.target.value }
                  })}
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
                <label className="block text-sm font-medium text-gray-700">Users (comma-separated)</label>
                <input
                  type="text"
                  value={newBusiness.users.join(', ')}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    users: e.target.value.split(',').map(user => user.trim())
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="John Doe, Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newBusiness.profile.description}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    profile: { ...newBusiness.profile, description: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={newBusiness.notes}
                  onChange={(e) => setNewBusiness({ ...newBusiness, notes: e.target.value })}
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
                  Add Business
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

export default Businesses; 