const React = window.React;
const { useState, useEffect } = React;
const { Chart: ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } = require('chart.js');
const { Bar } = require('react-chartjs-2');

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ImportExport() {
  const [activeTab, setActiveTab] = useState('import');
  const [importType, setImportType] = useState('');
  const [importFormat, setImportFormat] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [exportType, setExportType] = useState('');
  const [exportFormat, setExportFormat] = useState('');
  const [exportStatus, setExportStatus] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [exportHistory, setExportHistory] = useState([]);

  const handleImport = async (e) => {
    e.preventDefault();
    setImportStatus({ type: 'loading', message: 'Importing data...' });
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', importType);
      formData.append('format', importFormat);

      const response = await fetch('http://localhost:3000/api/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Import failed');

      setImportStatus({ type: 'success', message: 'Data imported successfully!' });
      // Refresh import history
      fetchImportHistory();
    } catch (error) {
      setImportStatus({ type: 'error', message: error.message });
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setExportStatus({ type: 'loading', message: 'Exporting data...' });
    try {
      const response = await fetch(`http://localhost:3000/api/export?type=${exportType}&format=${exportFormat}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${exportType}-${new Date().toISOString()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExportStatus({ type: 'success', message: 'Data exported successfully!' });
      // Refresh export history
      fetchExportHistory();
    } catch (error) {
      setExportStatus({ type: 'error', message: error.message });
    }
  };

  const getImportHistoryChartData = () => ({
    labels: importHistory.map(record => new Date(record.date).toLocaleDateString()),
    datasets: [{
      label: 'Import Activity',
      data: importHistory.map(record => record.recordCount),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  });

  const getExportHistoryChartData = () => ({
    labels: exportHistory.map(record => new Date(record.date).toLocaleDateString()),
    datasets: [{
      label: 'Export Activity',
      data: exportHistory.map(record => 1), // Each export counts as 1 activity
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  });

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Import/Export Tools'),
      React.createElement('div', { className: 'flex space-x-4' },
        React.createElement('button', {
          onClick: () => setActiveTab('import'),
          className: `px-4 py-2 rounded ${activeTab === 'import' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`
        }, 'Import'),
        React.createElement('button', {
          onClick: () => setActiveTab('export'),
          className: `px-4 py-2 rounded ${activeTab === 'export' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`
        }, 'Export')
      )
    ),
    activeTab === 'import' ? React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Import Data'),
          React.createElement('form', { onSubmit: handleImport },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Data Type'),
                React.createElement('select', {
                  value: importType,
                  onChange: (e) => setImportType(e.target.value),
                  className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  required: true
                },
                  React.createElement('option', { value: '' }, 'Select type...'),
                  React.createElement('option', { value: 'transactions' }, 'Transactions'),
                  React.createElement('option', { value: 'budgets' }, 'Budgets'),
                  React.createElement('option', { value: 'categories' }, 'Categories'),
                  React.createElement('option', { value: 'goals' }, 'Goals'),
                  React.createElement('option', { value: 'debts' }, 'Debts')
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Format'),
                React.createElement('select', {
                  value: importFormat,
                  onChange: (e) => setImportFormat(e.target.value),
                  className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  required: true
                },
                  React.createElement('option', { value: '' }, 'Select format...'),
                  React.createElement('option', { value: 'csv' }, 'CSV'),
                  React.createElement('option', { value: 'json' }, 'JSON'),
                  React.createElement('option', { value: 'excel' }, 'Excel')
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'File'),
                React.createElement('input', {
                  type: 'file',
                  onChange: (e) => setImportFile(e.target.files[0]),
                  className: 'mt-1 block w-full',
                  required: true,
                  accept: importFormat === 'csv' ? '.csv' :
                         importFormat === 'json' ? '.json' :
                         importFormat === 'excel' ? '.xlsx,.xls' : undefined
                })
              ),
              importStatus && React.createElement('div', {
                className: `p-4 rounded ${
                  importStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                  importStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`
              }, importStatus.message),
              React.createElement('button', {
                type: 'submit',
                className: 'w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600',
                disabled: importStatus?.type === 'loading'
              }, 'Import')
            )
          )
        ),
        React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Import History'),
          React.createElement('div', { className: 'space-y-4' },
            importHistory.map(record => React.createElement('div', {
              key: record.id,
              className: 'flex justify-between items-center p-4 border rounded'
            },
              React.createElement('div', null,
                React.createElement('p', { className: 'font-medium' }, record.type),
                React.createElement('p', { className: 'text-sm text-gray-500' },
                  new Date(record.date).toLocaleString()
                )
              ),
              React.createElement('div', { className: 'text-right' },
                React.createElement('p', {
                  className: `font-medium ${record.status === 'success' ? 'text-green-600' : 'text-red-600'}`
                }, record.status),
                React.createElement('p', { className: 'text-sm text-gray-500' },
                  `${record.recordCount} records`
                )
              )
            ))
          )
        )
      ),
      React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Import Activity'),
        React.createElement('div', { className: 'h-96' },
          React.createElement(Bar, { data: getImportHistoryChartData() })
        )
      )
    ) : React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Export Data'),
          React.createElement('form', { onSubmit: handleExport },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Data Type'),
                React.createElement('select', {
                  value: exportType,
                  onChange: (e) => setExportType(e.target.value),
                  className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  required: true
                },
                  React.createElement('option', { value: '' }, 'Select type...'),
                  React.createElement('option', { value: 'all' }, 'All Data'),
                  React.createElement('option', { value: 'transactions' }, 'Transactions'),
                  React.createElement('option', { value: 'budgets' }, 'Budgets'),
                  React.createElement('option', { value: 'categories' }, 'Categories'),
                  React.createElement('option', { value: 'goals' }, 'Goals'),
                  React.createElement('option', { value: 'debts' }, 'Debts')
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Format'),
                React.createElement('select', {
                  value: exportFormat,
                  onChange: (e) => setExportFormat(e.target.value),
                  className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  required: true
                },
                  React.createElement('option', { value: '' }, 'Select format...'),
                  React.createElement('option', { value: 'csv' }, 'CSV'),
                  React.createElement('option', { value: 'json' }, 'JSON'),
                  React.createElement('option', { value: 'excel' }, 'Excel')
                )
              ),
              exportStatus && React.createElement('div', {
                className: `p-4 rounded ${
                  exportStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                  exportStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`
              }, exportStatus.message),
              React.createElement('button', {
                type: 'submit',
                className: 'w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600',
                disabled: exportStatus?.type === 'loading'
              }, 'Export')
            )
          )
        ),
        React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Export History'),
          React.createElement('div', { className: 'space-y-4' },
            exportHistory.map(record => React.createElement('div', {
              key: record.id,
              className: 'flex justify-between items-center p-4 border rounded'
            },
              React.createElement('div', null,
                React.createElement('p', { className: 'font-medium' }, record.type),
                React.createElement('p', { className: 'text-sm text-gray-500' },
                  new Date(record.date).toLocaleString()
                )
              ),
              React.createElement('div', { className: 'text-right' },
                React.createElement('p', {
                  className: `font-medium ${record.status === 'success' ? 'text-green-600' : 'text-red-600'}`
                }, record.status),
                React.createElement('p', { className: 'text-sm text-gray-500' }, record.format)
              )
            ))
          )
        )
      ),
      React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Export Activity'),
        React.createElement('div', { className: 'h-96' },
          React.createElement(Bar, { data: getExportHistoryChartData() })
        )
      )
    )
  );
}

module.exports = { ImportExport }; 