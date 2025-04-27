const React = window.React;
const { useState, useEffect } = React;
const Chart = require('chart.js/auto');
const { Line } = require('react-chartjs-2');

// Register Chart.js components
Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend
);

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'savings'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGoal),
      });
      if (response.ok) {
        await fetchGoals();
        setNewGoal({
          name: '',
          targetAmount: '',
          currentAmount: '',
          deadline: '',
          category: 'savings'
        });
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleUpdateProgress = async (id, amount) => {
    try {
      const response = await fetch(`/api/goals/${id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      if (response.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getProgressData = (goal) => {
    const startDate = new Date(goal.createdAt);
    const endDate = new Date(goal.deadline);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    
    return {
      labels: Array.from({ length: totalDays }, (_, i) => 
        new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Target Progress',
          data: Array.from({ length: totalDays }, (_, i) => 
            (goal.targetAmount / totalDays) * (i + 1)
          ),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Actual Progress',
          data: Array.from({ length: daysPassed }, (_, i) => 
            Math.min(goal.currentAmount, (goal.targetAmount / totalDays) * (i + 1))
          ),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    };
  };

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Goals & Savings')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Add New Goal'),
        React.createElement('form', { onSubmit: handleAddGoal },
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Goal Name'),
              React.createElement('input', {
                type: 'text',
                value: newGoal.name,
                onChange: (e) => setNewGoal({ ...newGoal, name: e.target.value }),
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                required: true
              })
            ),
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Target Amount'),
                React.createElement('input', {
                  type: 'number',
                  value: newGoal.targetAmount,
                  onChange: (e) => setNewGoal({ ...newGoal, targetAmount: e.target.value }),
                  className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  required: true
                })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Current Amount'),
                React.createElement('input', {
                  type: 'number',
                  value: newGoal.currentAmount,
                  onChange: (e) => setNewGoal({ ...newGoal, currentAmount: e.target.value }),
                  className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  required: true
                })
              )
            ),
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Deadline'),
                React.createElement('input', {
                  type: 'date',
                  value: newGoal.deadline,
                  onChange: (e) => setNewGoal({ ...newGoal, deadline: e.target.value }),
                  className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  required: true
                })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Category'),
                React.createElement('select', {
                  value: newGoal.category,
                  onChange: (e) => setNewGoal({ ...newGoal, category: e.target.value }),
                  className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  required: true
                },
                  React.createElement('option', { value: 'savings' }, 'Savings'),
                  React.createElement('option', { value: 'investment' }, 'Investment'),
                  React.createElement('option', { value: 'purchase' }, 'Purchase'),
                  React.createElement('option', { value: 'other' }, 'Other')
                )
              )
            ),
            React.createElement('button', {
              type: 'submit',
              className: 'w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
            }, 'Add Goal')
          )
        )
      ),
      React.createElement('div', { className: 'space-y-6' },
        goals.map((goal) => 
          React.createElement('div', { key: goal.id, className: 'bg-white rounded-lg shadow p-6' },
            React.createElement('div', { className: 'flex justify-between items-start mb-4' },
              React.createElement('div', null,
                React.createElement('h3', { className: 'text-lg font-medium' }, goal.name),
                React.createElement('p', { className: 'text-sm text-gray-500' },
                  `Target: $${goal.targetAmount} | Current: $${goal.currentAmount}`
                ),
                React.createElement('p', { className: 'text-sm text-gray-500' },
                  `Deadline: ${new Date(goal.deadline).toLocaleDateString()}`
                )
              ),
              React.createElement('div', { className: 'flex space-x-2' },
                React.createElement('button', {
                  onClick: () => handleDeleteGoal(goal.id),
                  className: 'text-red-600 hover:text-red-800'
                }, 'Delete')
              )
            ),
            React.createElement('div', { className: 'h-48' },
              React.createElement(Line, { data: getProgressData(goal) })
            ),
            React.createElement('div', { className: 'mt-4' },
              React.createElement('div', { className: 'flex items-center space-x-4' },
                React.createElement('input', {
                  type: 'number',
                  placeholder: 'Add amount',
                  className: 'flex-1 border rounded px-3 py-2',
                  onChange: (e) => handleUpdateProgress(goal.id, e.target.value)
                }),
                React.createElement('button', {
                  onClick: () => handleUpdateProgress(goal.id, 0),
                  className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                }, 'Update Progress')
              )
            )
          )
        )
      )
    )
  );
};

module.exports = { Goals }; 