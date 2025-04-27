const React = window.React;
const { useState, useEffect } = React;

function SavingGoals() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    currency: 'USD',
    targetDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/goals');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGoal),
      });
      const data = await response.json();
      setGoals([...goals, data]);
      setShowModal(false);
      setNewGoal({
        name: '',
        targetAmount: '',
        currentAmount: '',
        currency: 'USD',
        targetDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/goals/${id}`, {
        method: 'DELETE',
      });
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
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

  const calculateProgress = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getStatusColor = (progress) => {
    if (progress >= 100) return 'bg-green-100 text-green-800';
    if (progress >= 75) return 'bg-blue-100 text-blue-800';
    if (progress >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Saving Goals'),
      React.createElement('button', {
        onClick: () => setShowModal(true),
        className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
      }, 'Add New Goal')
    ),
    loading ? React.createElement('div', { className: 'flex justify-center items-center h-64' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' })
    ) : React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      goals.map(goal => React.createElement('div', {
        key: goal.id,
        className: 'bg-white rounded-lg shadow p-6'
      },
        React.createElement('div', { className: 'flex justify-between items-start mb-4' },
          React.createElement('div', null,
            React.createElement('h2', { className: 'text-xl font-semibold' }, goal.name),
            React.createElement('p', { className: 'text-gray-500' }, `Target: ${formatCurrency(goal.targetAmount, goal.currency)}`)
          ),
          React.createElement('button', {
            onClick: () => handleDeleteGoal(goal.id),
            className: 'text-red-500 hover:text-red-700'
          }, 'Delete')
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('div', { className: 'flex justify-between text-sm text-gray-500 mb-1' },
            React.createElement('span', null, 'Progress'),
            React.createElement('span', null, `${calculateProgress(goal.currentAmount, goal.targetAmount)}%`)
          ),
          React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2.5' },
            React.createElement('div', {
              className: 'bg-blue-500 h-2.5 rounded-full',
              style: { width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }
            })
          )
        ),
        React.createElement('div', { className: 'flex justify-between text-sm' },
          React.createElement('span', { className: 'text-gray-500' }, 'Current Amount'),
          React.createElement('span', null, formatCurrency(goal.currentAmount, goal.currency))
        ),
        React.createElement('div', { className: 'flex justify-between text-sm mt-1' },
          React.createElement('span', { className: 'text-gray-500' }, 'Target Date'),
          React.createElement('span', null, formatDate(goal.targetDate))
        ),
        goal.notes && React.createElement('p', { className: 'mt-4 text-sm text-gray-600' }, goal.notes)
      ))
    ),
    showModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'bg-white rounded-lg p-6 w-full max-w-md' },
        React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Add New Goal'),
        React.createElement('form', { onSubmit: handleAddGoal },
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-gray-700 text-sm font-bold mb-2' }, 'Goal Name'),
            React.createElement('input', {
              type: 'text',
              value: newGoal.name,
              onChange: (e) => setNewGoal({ ...newGoal, name: e.target.value }),
              className: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
              required: true
            })
          ),
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-gray-700 text-sm font-bold mb-2' }, 'Target Amount'),
            React.createElement('input', {
              type: 'number',
              value: newGoal.targetAmount,
              onChange: (e) => setNewGoal({ ...newGoal, targetAmount: e.target.value }),
              className: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
              required: true
            })
          ),
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-gray-700 text-sm font-bold mb-2' }, 'Current Amount'),
            React.createElement('input', {
              type: 'number',
              value: newGoal.currentAmount,
              onChange: (e) => setNewGoal({ ...newGoal, currentAmount: e.target.value }),
              className: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
              required: true
            })
          ),
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-gray-700 text-sm font-bold mb-2' }, 'Target Date'),
            React.createElement('input', {
              type: 'date',
              value: newGoal.targetDate,
              onChange: (e) => setNewGoal({ ...newGoal, targetDate: e.target.value }),
              className: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
              required: true
            })
          ),
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-gray-700 text-sm font-bold mb-2' }, 'Notes'),
            React.createElement('textarea', {
              value: newGoal.notes,
              onChange: (e) => setNewGoal({ ...newGoal, notes: e.target.value }),
              className: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
              rows: 3
            })
          ),
          React.createElement('div', { className: 'flex justify-end space-x-4' },
            React.createElement('button', {
              type: 'button',
              onClick: () => setShowModal(false),
              className: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
            }, 'Cancel'),
            React.createElement('button', {
              type: 'submit',
              className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600',
              disabled: loading
            }, loading ? 'Adding...' : 'Add Goal')
          )
        )
      )
    )
  );
}

module.exports = { SavingGoals }; 