const React = window.React;
const { useState, useEffect } = React;
const { Bar, Line } = require('react-chartjs-2');
const ChartJS = require('chart.js').Chart;
const {
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} = require('chart.js');

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
      const response = await fetch('http://localhost:3000/api/tax/income');
      const data = await response.json();
      setIncome(data);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const fetchDeductions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/tax/deductions');
      const data = await response.json();
      setDeductions(data);
    } catch (error) {
      console.error('Error fetching deductions:', error);
    }
  };

  const fetchTaxBrackets = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/tax/brackets');
      const data = await response.json();
      setTaxBrackets(data);
    } catch (error) {
      console.error('Error fetching tax brackets:', error);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/tax/income', {
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
      const response = await fetch('http://localhost:3000/api/tax/deductions', {
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

  return React.createElement(
    'div',
    { className: 'p-6' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Tax Planning'),
      React.createElement(
        'div',
        { className: 'flex space-x-4' },
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('overview'),
            className: `px-4 py-2 rounded ${
              activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`
          },
          'Overview'
        ),
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('income'),
            className: `px-4 py-2 rounded ${
              activeTab === 'income' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`
          },
          'Income'
        ),
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('deductions'),
            className: `px-4 py-2 rounded ${
              activeTab === 'deductions' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`
          },
          'Deductions'
        )
      )
    ),
    activeTab === 'overview' ? React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, 'Total Income'),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-green-600' },
            `$${calculateTotalIncome().toLocaleString()}`
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, 'Total Deductions'),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-blue-600' },
            `$${calculateTotalDeductions().toLocaleString()}`
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, 'Estimated Tax'),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-red-600' },
            `$${calculateEstimatedTax().toLocaleString()}`
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Income Distribution'),
          React.createElement(
            'div',
            { className: 'h-64' },
            React.createElement(Bar, { data: getIncomeChartData() })
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Deductions Distribution'),
          React.createElement(
            'div',
            { className: 'h-64' },
            React.createElement(Bar, { data: getDeductionsChartData() })
          )
        )
      )
    ) : activeTab === 'income' ? React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement(
        'form',
        { onSubmit: handleAddIncome, className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Add Income'),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Source'),
            React.createElement('input', {
              type: 'text',
              value: newIncome.source,
              onChange: (e) => setNewIncome({ ...newIncome, source: e.target.value }),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Amount'),
            React.createElement('input', {
              type: 'number',
              value: newIncome.amount,
              onChange: (e) => setNewIncome({ ...newIncome, amount: e.target.value }),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Type'),
            React.createElement(
              'select',
              {
                value: newIncome.type,
                onChange: (e) => setNewIncome({ ...newIncome, type: e.target.value }),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              },
              React.createElement('option', { value: 'salary' }, 'Salary'),
              React.createElement('option', { value: 'investment' }, 'Investment'),
              React.createElement('option', { value: 'business' }, 'Business'),
              React.createElement('option', { value: 'other' }, 'Other')
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Frequency'),
            React.createElement(
              'select',
              {
                value: newIncome.frequency,
                onChange: (e) => setNewIncome({ ...newIncome, frequency: e.target.value }),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              },
              React.createElement('option', { value: 'monthly' }, 'Monthly'),
              React.createElement('option', { value: 'quarterly' }, 'Quarterly'),
              React.createElement('option', { value: 'annually' }, 'Annually')
            )
          )
        ),
        React.createElement(
          'button',
          {
            type: 'submit',
            className: 'mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700'
          },
          'Add Income'
        )
      ),
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Income List'),
        React.createElement(
          'table',
          { className: 'min-w-full divide-y divide-gray-200' },
          React.createElement(
            'thead',
            { className: 'bg-gray-50' },
            React.createElement(
              'tr',
              null,
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Source'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Amount'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Type'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Frequency')
            )
          ),
          React.createElement(
            'tbody',
            { className: 'bg-white divide-y divide-gray-200' },
            income.map((item, index) =>
              React.createElement(
                'tr',
                { key: index },
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, item.source),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, `$${item.amount}`),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, item.type),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, item.frequency)
              )
            )
          )
        )
      )
    ) : React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement(
        'form',
        { onSubmit: handleAddDeduction, className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Add Deduction'),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Name'),
            React.createElement('input', {
              type: 'text',
              value: newDeduction.name,
              onChange: (e) => setNewDeduction({ ...newDeduction, name: e.target.value }),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Amount'),
            React.createElement('input', {
              type: 'number',
              value: newDeduction.amount,
              onChange: (e) => setNewDeduction({ ...newDeduction, amount: e.target.value }),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Type'),
            React.createElement(
              'select',
              {
                value: newDeduction.type,
                onChange: (e) => setNewDeduction({ ...newDeduction, type: e.target.value }),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              },
              React.createElement('option', { value: 'standard' }, 'Standard'),
              React.createElement('option', { value: 'itemized' }, 'Itemized')
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Category'),
            React.createElement(
              'select',
              {
                value: newDeduction.category,
                onChange: (e) => setNewDeduction({ ...newDeduction, category: e.target.value }),
                className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              },
              React.createElement('option', { value: 'charitable' }, 'Charitable'),
              React.createElement('option', { value: 'medical' }, 'Medical'),
              React.createElement('option', { value: 'education' }, 'Education'),
              React.createElement('option', { value: 'other' }, 'Other')
            )
          )
        ),
        React.createElement(
          'button',
          {
            type: 'submit',
            className: 'mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700'
          },
          'Add Deduction'
        )
      ),
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Deductions List'),
        React.createElement(
          'table',
          { className: 'min-w-full divide-y divide-gray-200' },
          React.createElement(
            'thead',
            { className: 'bg-gray-50' },
            React.createElement(
              'tr',
              null,
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Name'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Amount'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Type'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Category')
            )
          ),
          React.createElement(
            'tbody',
            { className: 'bg-white divide-y divide-gray-200' },
            deductions.map((item, index) =>
              React.createElement(
                'tr',
                { key: index },
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, item.name),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, `$${item.amount}`),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, item.type),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, item.category)
              )
            )
          )
        )
      )
    )
  );
};

module.exports = { TaxPlanning }; 