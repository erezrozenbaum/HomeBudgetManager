import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TaxPlanning = () => {
  const [income, setIncome] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [newIncome, setNewIncome] = useState({
    source: '',
    amount: '',
    type: 'salary',
    frequency: 'monthly'
  });
  const [newDeduction, setNewDeduction] = useState({
    name: '',
    amount: '',
    type: 'standard',
    category: 'charitable'
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchIncome();
    fetchDeductions();
    fetchTaxBrackets();
  }, []);

  const fetchIncome = async () => {
    try {
      const response = await fetch('/api/tax/income');
      const data = await response.json();
      setIncome(data);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const fetchDeductions = async () => {
    try {
      const response = await fetch('/api/tax/deductions');
      const data = await response.json();
      setDeductions(data);
    } catch (error) {
      console.error('Error fetching deductions:', error);
    }
  };

  const fetchTaxBrackets = async () => {
    try {
      const response = await fetch('/api/tax/brackets');
      const data = await response.json();
      setTaxBrackets(data);
    } catch (error) {
      console.error('Error fetching tax brackets:', error);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tax/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncome),
      });
      if (response.ok) {
        await fetchIncome();
        setNewIncome({
          source: '',
          amount: '',
          type: 'salary',
          frequency: 'monthly'
        });
      }
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleAddDeduction = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tax/deductions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDeduction),
      });
      if (response.ok) {
        await fetchDeductions();
        setNewDeduction({
          name: '',
          amount: '',
          type: 'standard',
          category: 'charitable'
        });
      }
    } catch (error) {
      console.error('Error adding deduction:', error);
    }
  };

  const calculateTotalIncome = () => {
    return income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  };

  const calculateTotalDeductions = () => {
    return deductions.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  };

  const calculateTaxableIncome = () => {
    return calculateTotalIncome() - calculateTotalDeductions();
  };

  const calculateEstimatedTax = () => {
    const taxableIncome = calculateTaxableIncome();
    let tax = 0;
    
    for (const bracket of taxBrackets) {
      if (taxableIncome > bracket.min) {
        const bracketAmount = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
        tax += bracketAmount * (bracket.rate / 100);
      }
    }
    
    return tax;
  };

  const getIncomeChartData = () => {
    const incomeTypes = [...new Set(income.map(item => item.type))];
    return {
      labels: incomeTypes,
      datasets: [
        {
          label: 'Income by Type',
          data: incomeTypes.map(type => 
            income
              .filter(item => item.type === type)
              .reduce((sum, item) => sum + parseFloat(item.amount), 0)
          ),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
  };

  const getDeductionsChartData = () => {
    const deductionCategories = [...new Set(deductions.map(item => item.category))];
    return {
      labels: deductionCategories,
      datasets: [
        {
          label: 'Deductions by Category',
          data: deductionCategories.map(category => 
            deductions
              .filter(item => item.category === category)
              .reduce((sum, item) => sum + parseFloat(item.amount), 0)
          ),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tax Planning</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded ${
              activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2 rounded ${
              activeTab === 'income' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('deductions')}
            className={`px-4 py-2 rounded ${
              activeTab === 'deductions' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Deductions
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Total Income</h2>
              <p className="text-3xl font-bold text-green-600">
                ${calculateTotalIncome().toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Total Deductions</h2>
              <p className="text-3xl font-bold text-blue-600">
                ${calculateTotalDeductions().toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Estimated Tax</h2>
              <p className="text-3xl font-bold text-red-600">
                ${calculateEstimatedTax().toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Income Distribution</h2>
              <div className="h-64">
                <Bar data={getIncomeChartData()} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Deductions by Category</h2>
              <div className="h-64">
                <Bar data={getDeductionsChartData()} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tax Brackets</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bracket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taxBrackets.map((bracket, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${bracket.min.toLocaleString()} - ${bracket.max.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bracket.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'income' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Add Income Source</h2>
            <form onSubmit={handleAddIncome}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <input
                    type="text"
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={newIncome.type}
                      onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="salary">Salary</option>
                      <option value="investment">Investment</option>
                      <option value="rental">Rental</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <select
                    value={newIncome.frequency}
                    onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Income
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {income.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{item.source}</h3>
                    <p className="text-sm text-gray-500">
                      Amount: ${parseFloat(item.amount).toLocaleString()} | Type: {item.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Frequency: {item.frequency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Add Deduction</h2>
            <form onSubmit={handleAddDeduction}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newDeduction.name}
                    onChange={(e) => setNewDeduction({ ...newDeduction, name: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={newDeduction.amount}
                      onChange={(e) => setNewDeduction({ ...newDeduction, amount: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={newDeduction.type}
                      onChange={(e) => setNewDeduction({ ...newDeduction, type: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="standard">Standard</option>
                      <option value="itemized">Itemized</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={newDeduction.category}
                    onChange={(e) => setNewDeduction({ ...newDeduction, category: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="charitable">Charitable</option>
                    <option value="medical">Medical</option>
                    <option value="education">Education</option>
                    <option value="home">Home</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Deduction
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {deductions.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Amount: ${parseFloat(item.amount).toLocaleString()} | Type: {item.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category: {item.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxPlanning; 