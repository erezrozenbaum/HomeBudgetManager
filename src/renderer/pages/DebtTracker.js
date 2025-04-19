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

const DebtTracker = () => {
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    name: '',
    amount: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: '',
    type: 'credit'
  });

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const response = await fetch('/api/debts');
      const data = await response.json();
      setDebts(data);
    } catch (error) {
      console.error('Error fetching debts:', error);
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDebt),
      });
      if (response.ok) {
        await fetchDebts();
        setNewDebt({
          name: '',
          amount: '',
          interestRate: '',
          minimumPayment: '',
          dueDate: '',
          type: 'credit'
        });
      }
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  const handleMakePayment = async (id, amount) => {
    try {
      const response = await fetch(`/api/debts/${id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      if (response.ok) {
        await fetchDebts();
      }
    } catch (error) {
      console.error('Error making payment:', error);
    }
  };

  const handleDeleteDebt = async (id) => {
    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchDebts();
      }
    } catch (error) {
      console.error('Error deleting debt:', error);
    }
  };

  const calculatePaymentSchedule = (debt) => {
    const schedule = [];
    let balance = parseFloat(debt.amount);
    const monthlyRate = parseFloat(debt.interestRate) / 12 / 100;
    const monthlyPayment = parseFloat(debt.minimumPayment);

    while (balance > 0) {
      const interest = balance * monthlyRate;
      const principal = Math.min(monthlyPayment - interest, balance);
      balance -= principal;
      schedule.push({
        date: new Date(new Date().setMonth(new Date().getMonth() + schedule.length)),
        balance: balance.toFixed(2),
        interest: interest.toFixed(2),
        principal: principal.toFixed(2)
      });
    }

    return schedule;
  };

  const getDebtChartData = (debt) => {
    const schedule = calculatePaymentSchedule(debt);
    return {
      labels: schedule.map(p => p.date.toLocaleDateString()),
      datasets: [
        {
          label: 'Remaining Balance',
          data: schedule.map(p => p.balance),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Interest Paid',
          data: schedule.map(p => p.interest),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Debt Tracker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Debt</h2>
          <form onSubmit={handleAddDebt}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Debt Name</label>
                <input
                  type="text"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    value={newDebt.amount}
                    onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={newDebt.interestRate}
                    onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Payment</label>
                  <input
                    type="number"
                    value={newDebt.minimumPayment}
                    onChange={(e) => setNewDebt({ ...newDebt, minimumPayment: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={newDebt.dueDate}
                    onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newDebt.type}
                  onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="credit">Credit Card</option>
                  <option value="loan">Loan</option>
                  <option value="mortgage">Mortgage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Debt
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {debts.map((debt) => (
            <div key={debt.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{debt.name}</h3>
                  <p className="text-sm text-gray-500">
                    Amount: ${debt.amount} | Interest: {debt.interestRate}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Minimum Payment: ${debt.minimumPayment} | Due: {new Date(debt.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteDebt(debt.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="h-48">
                <Line data={getDebtChartData(debt)} />
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    placeholder="Payment amount"
                    className="flex-1 border rounded px-3 py-2"
                    onChange={(e) => handleMakePayment(debt.id, e.target.value)}
                  />
                  <button
                    onClick={() => handleMakePayment(debt.id, 0)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Make Payment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebtTracker; 