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

const BillReminders = () => {
  const [bills, setBills] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly',
    category: '',
    notes: '',
    autoPay: false
  });
  const [activeTab, setActiveTab] = useState('bills');

  useEffect(() => {
    fetchBills();
    fetchPaymentHistory();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/bills');
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/bills/history');
      const data = await response.json();
      setPaymentHistory(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBill),
      });
      if (response.ok) {
        await fetchBills();
        setNewBill({
          name: '',
          amount: '',
          dueDate: '',
          frequency: 'monthly',
          category: '',
          notes: '',
          autoPay: false
        });
      }
    } catch (error) {
      console.error('Error adding bill:', error);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/bills/${id}/pay`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchBills();
        await fetchPaymentHistory();
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  const handleDeleteBill = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/bills/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchBills();
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  const getPaymentChartData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
    }).reverse();

    return {
      labels: last6Months,
      datasets: [
        {
          label: 'Total Bills Paid',
          data: last6Months.map(month => 
            paymentHistory
              .filter(p => new Date(p.date).toLocaleDateString('default', { month: 'short', year: 'numeric' }) === month)
              .reduce((sum, p) => sum + parseFloat(p.amount), 0)
          ),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bill Reminders</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2 rounded ${
              activeTab === 'bills' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Bills
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded ${
              activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Payment History
          </button>
        </div>
      </div>

      {activeTab === 'bills' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Bill</h2>
            <form onSubmit={handleAddBill}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Name</label>
                  <input
                    type="text"
                    value={newBill.name}
                    onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={newBill.amount}
                      onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={newBill.dueDate}
                      onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <select
                      value={newBill.frequency}
                      onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      value={newBill.category}
                      onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={newBill.notes}
                    onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newBill.autoPay}
                      onChange={(e) => setNewBill({ ...newBill, autoPay: e.target.checked })}
                      className="mr-2"
                    />
                    Enable Auto-Pay
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Bill
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {bills.map((bill) => (
              <div key={bill.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{bill.name}</h3>
                    <p className="text-sm text-gray-500">
                      Amount: ${bill.amount} | Due: {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Frequency: {bill.frequency} | Category: {bill.category}
                    </p>
                    {bill.notes && (
                      <p className="text-sm text-gray-500 mt-1">Notes: {bill.notes}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {!bill.paid && (
                      <button
                        onClick={() => handleMarkAsPaid(bill.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Mark as Paid
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {bill.autoPay && (
                  <div className="mt-2 text-sm text-blue-600">
                    Auto-Pay Enabled
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment History</h2>
            <div className="h-64">
              <Line data={getPaymentChartData()} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Payments</h2>
            </div>
            <div className="divide-y">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{payment.billName}</h3>
                    <p className="text-sm text-gray-500">
                      Amount: ${payment.amount} | Date: {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {payment.autoPaid ? 'Auto-Paid' : 'Manual Payment'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillReminders; 