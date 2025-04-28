const React = window.React;
const { useState, useEffect } = React;
const { format } = require('date-fns');
const { useAuth } = require('../context/AuthContext');
const { api } = require('../utils/api');
const { saveAs } = require('file-saver');
const { SearchIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } = require('@heroicons/react/outline');

const AdminUserAudit = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    userId: '',
    startDate: '',
    endDate: '',
    actionType: '',
    limit: 50
  });

  const actionTypes = [
    'login',
    'logout',
    'create_transaction',
    'update_transaction',
    'delete_transaction',
    'create_investment',
    'update_investment',
    'delete_investment',
    'create_stock',
    'update_stock',
    'delete_stock',
    'create_crypto',
    'update_crypto',
    'delete_crypto',
    'import_data',
    'export_data',
    'update_settings',
    'update_profile'
  ];

  useEffect(() => {
    fetchUsers();
    fetchActions();
  }, [filters, currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user-audit/all-actions', {
        params: {
          userId: filters.userId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          actionType: filters.actionType,
          limit: filters.limit,
          page: currentPage,
          search: searchQuery
        }
      });
      setActions(response.data.actions);
      setTotalCount(response.data.totalCount);
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchActions();
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/user-audit/export', {
        params: filters,
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      saveAs(blob, `user-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    } catch (err) {
      setError('Failed to export audit log');
      console.error(err);
    }
  };

  const getActionTypeColor = (actionType) => {
    const colors = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      create_transaction: 'bg-blue-100 text-blue-800',
      update_transaction: 'bg-yellow-100 text-yellow-800',
      delete_transaction: 'bg-red-100 text-red-800',
      create_investment: 'bg-purple-100 text-purple-800',
      update_investment: 'bg-indigo-100 text-indigo-800',
      delete_investment: 'bg-pink-100 text-pink-800',
      create_stock: 'bg-teal-100 text-teal-800',
      update_stock: 'bg-cyan-100 text-cyan-800',
      delete_stock: 'bg-orange-100 text-orange-800',
      create_crypto: 'bg-amber-100 text-amber-800',
      update_crypto: 'bg-lime-100 text-lime-800',
      delete_crypto: 'bg-rose-100 text-rose-800',
      import_data: 'bg-emerald-100 text-emerald-800',
      export_data: 'bg-sky-100 text-sky-800',
      update_settings: 'bg-violet-100 text-violet-800',
      update_profile: 'bg-fuchsia-100 text-fuchsia-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(totalCount / filters.limit);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800' }, 'User Audit Log'),
      React.createElement('button', {
        onClick: handleExport,
        className: 'flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
      },
        React.createElement(DownloadIcon, { className: 'w-5 h-5' }),
        React.createElement('span', null, 'Export')
      )
    ),
    React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
      React.createElement('form', { onSubmit: handleSearch, className: 'space-y-4' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'User'),
            React.createElement('select', {
              name: 'userId',
              value: filters.userId,
              onChange: handleFilterChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            },
              React.createElement('option', { value: '' }, 'All Users'),
              users.map(user => React.createElement('option', { key: user.id, value: user.id }, user.email))
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Action Type'),
            React.createElement('select', {
              name: 'actionType',
              value: filters.actionType,
              onChange: handleFilterChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            },
              React.createElement('option', { value: '' }, 'All Actions'),
              actionTypes.map(type => React.createElement('option', { key: type, value: type }, type.replace(/_/g, ' ')))
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Start Date'),
            React.createElement('input', {
              type: 'date',
              name: 'startDate',
              value: filters.startDate,
              onChange: handleFilterChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'End Date'),
            React.createElement('input', {
              type: 'date',
              name: 'endDate',
              value: filters.endDate,
              onChange: handleFilterChange,
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            })
          )
        ),
        React.createElement('div', { className: 'flex justify-end' },
          React.createElement('button', {
            type: 'submit',
            className: 'flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
          },
            React.createElement(SearchIcon, { className: 'w-5 h-5' }),
            React.createElement('span', null, 'Search')
          )
        )
      ),
      loading ? React.createElement('div', { className: 'flex justify-center items-center h-64' },
        React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' })
      ) : error ? React.createElement('div', { className: 'text-red-500 text-center' }, error) :
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', { className: 'overflow-x-auto' },
            React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
              React.createElement('thead', { className: 'bg-gray-50' },
                React.createElement('tr', null,
                  React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'User'),
                  React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Action'),
                  React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Details'),
                  React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Timestamp')
                )
              ),
              React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
                actions.map(action => React.createElement('tr', { key: action.id },
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' }, action.user.email),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('span', {
                      className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionTypeColor(action.actionType)}`
                    }, action.actionType.replace(/_/g, ' '))
                  ),
                  React.createElement('td', { className: 'px-6 py-4' }, action.details),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    format(new Date(action.timestamp), 'yyyy-MM-dd HH:mm:ss')
                  )
                ))
              )
            )
          ),
          React.createElement('div', { className: 'flex justify-between items-center' },
            React.createElement('div', { className: 'text-sm text-gray-500' },
              `Showing ${(currentPage - 1) * filters.limit + 1} to ${Math.min(currentPage * filters.limit, totalCount)} of ${totalCount} actions`
            ),
            React.createElement('div', { className: 'flex space-x-2' },
              React.createElement('button', {
                onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
                disabled: currentPage === 1,
                className: `flex items-center px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`
              },
                React.createElement(ChevronLeftIcon, { className: 'w-5 h-5' })
              ),
              React.createElement('button', {
                onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
                disabled: currentPage === totalPages,
                className: `flex items-center px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`
              },
                React.createElement(ChevronRightIcon, { className: 'w-5 h-5' })
              )
            )
          )
        )
    )
  );
};

module.exports = AdminUserAudit; 