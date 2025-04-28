const React = window.React;
const { useState, useEffect } = React;

function MigrationManager() {
  const [migrations, setMigrations] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMigrations();
  }, []);

  const fetchMigrations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/migrations');
      const data = await response.json();
      setMigrations(data);
    } catch (error) {
      console.error('Error fetching migrations:', error);
    }
  };

  const runMigrations = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/migrations/run', {
        method: 'POST',
      });
      if (response.ok) {
        await fetchMigrations();
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError(error.message);
    }
    setIsRunning(false);
  };

  const rollbackMigration = async (migrationId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/migrations/${migrationId}/rollback`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchMigrations();
      }
    } catch (error) {
      console.error('Error rolling back migration:', error);
    }
  };

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Database Migrations'),
      React.createElement('button', {
        onClick: runMigrations,
        disabled: isRunning,
        className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
      }, isRunning ? 'Running Migrations...' : 'Run Migrations')
    ),
    error && React.createElement('div', {
      className: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6'
    }, error),
    React.createElement('div', { className: 'bg-white rounded-lg shadow overflow-hidden' },
      React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
        React.createElement('thead', { className: 'bg-gray-50' },
          React.createElement('tr', null,
            ['Migration', 'Status', 'Executed At', 'Actions'].map(header =>
              React.createElement('th', {
                key: header,
                className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              }, header)
            )
          )
        ),
        React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
          migrations.map(migration =>
            React.createElement('tr', { key: migration.id },
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('div', { className: 'text-sm font-medium text-gray-900' }, migration.name)
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                React.createElement('span', {
                  className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    migration.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : migration.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`
                }, migration.status)
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
                migration.executed_at
                  ? new Date(migration.executed_at).toLocaleString()
                  : 'Not executed'
              ),
              React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                migration.status === 'completed' && React.createElement('button', {
                  onClick: () => rollbackMigration(migration.id),
                  className: 'text-yellow-600 hover:text-yellow-900'
                }, 'Rollback')
              )
            )
          )
        )
      )
    ),
    React.createElement('div', { className: 'mt-6 bg-white p-6 rounded-lg shadow' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Migration Status'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
        React.createElement('div', { className: 'p-4 bg-blue-50 rounded' },
          React.createElement('h3', { className: 'text-sm text-blue-600' }, 'Total Migrations'),
          React.createElement('p', { className: 'text-2xl font-bold' }, migrations.length)
        ),
        React.createElement('div', { className: 'p-4 bg-green-50 rounded' },
          React.createElement('h3', { className: 'text-sm text-green-600' }, 'Completed'),
          React.createElement('p', { className: 'text-2xl font-bold' },
            migrations.filter(m => m.status === 'completed').length
          )
        ),
        React.createElement('div', { className: 'p-4 bg-yellow-50 rounded' },
          React.createElement('h3', { className: 'text-sm text-yellow-600' }, 'Pending'),
          React.createElement('p', { className: 'text-2xl font-bold' },
            migrations.filter(m => m.status === 'pending').length
          )
        )
      )
    )
  );
}

module.exports = { MigrationManager }; 