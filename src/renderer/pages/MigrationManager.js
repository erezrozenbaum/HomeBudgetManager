import React, { useState, useEffect } from 'react';

const MigrationManager = () => {
  const [migrations, setMigrations] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMigrations();
  }, []);

  const fetchMigrations = async () => {
    try {
      const response = await fetch('/api/migrations');
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
      const response = await fetch('/api/migrations/run', {
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
      const response = await fetch(`/api/migrations/${migrationId}/rollback`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchMigrations();
      }
    } catch (error) {
      console.error('Error rolling back migration:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Database Migrations</h1>
        <button
          onClick={runMigrations}
          disabled={isRunning}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Running Migrations...' : 'Run Migrations'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Migration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Executed At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {migrations.map((migration) => (
              <tr key={migration.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{migration.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      migration.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : migration.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {migration.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {migration.executed_at
                    ? new Date(migration.executed_at).toLocaleString()
                    : 'Not executed'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {migration.status === 'completed' && (
                    <button
                      onClick={() => rollbackMigration(migration.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Rollback
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Migration Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="text-sm text-blue-600">Total Migrations</h3>
            <p className="text-2xl font-bold">{migrations.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <h3 className="text-sm text-green-600">Completed</h3>
            <p className="text-2xl font-bold">
              {migrations.filter((m) => m.status === 'completed').length}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <h3 className="text-sm text-yellow-600">Pending</h3>
            <p className="text-2xl font-bold">
              {migrations.filter((m) => m.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationManager; 