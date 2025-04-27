const React = window.React;
const { useState, useEffect } = React;
const { format } = require('date-fns');
const { useAuth } = require('../contexts/AuthContext');
const { api } = require('../utils/api');

const UserAudit = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchActions();
  }, [filters]);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user-audit/my-actions', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate
        }
      });
      setActions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch audit log');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return React.createElement('div', { className: 'flex justify-center items-center h-64' }, 'Loading...');
  if (error) return React.createElement('div', { className: 'text-red-500 text-center' }, error);

  return React.createElement(
    'div',
    { className: 'container mx-auto px-4 py-8' },
    React.createElement('h1', { className: 'text-2xl font-bold mb-6' }, 'User Audit Log'),
    React.createElement(
      'div',
      { className: 'mb-6 flex gap-4' },
      React.createElement(
        'div',
        null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Start Date'),
        React.createElement('input', {
          type: 'date',
          name: 'startDate',
          value: filters.startDate,
          onChange: handleFilterChange,
          className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
        })
      ),
      React.createElement(
        'div',
        null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'End Date'),
        React.createElement('input', {
          type: 'date',
          name: 'endDate',
          value: filters.endDate,
          onChange: handleFilterChange,
          className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
        })
      )
    ),
    React.createElement(
      'div',
      { className: 'bg-white shadow overflow-hidden sm:rounded-lg' },
      React.createElement(
        'table',
        { className: 'min-w-full divide-y divide-gray-200' },
        React.createElement(
          'thead',
          { className: 'bg-gray-50' },
          React.createElement(
            'tr',
            null,
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Timestamp'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Action'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Details'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'IP Address')
          )
        ),
        React.createElement(
          'tbody',
          { className: 'bg-white divide-y divide-gray-200' },
          actions.map((action) =>
            React.createElement(
              'tr',
              { key: action._id },
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
                format(new Date(action.timestamp), 'PPpp')
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' },
                action.actionType
              ),
              React.createElement('td', { className: 'px-6 py-4 text-sm text-gray-500' },
                JSON.stringify(action.details)
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
                action.ipAddress
              )
            )
          )
        )
      )
    )
  );
};

module.exports = { UserAudit }; 