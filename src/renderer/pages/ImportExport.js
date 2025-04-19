import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ImportExport = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState('transactions');
  const [importStatus, setImportStatus] = useState(null);
  const [exportType, setExportType] = useState('all');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportStatus, setExportStatus] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [exportHistory, setExportHistory] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImportStatus({ type: 'loading', message: 'Importing data...' });

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', importType);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImportStatus({ type: 'success', message: 'Import completed successfully' });
        setImportHistory(prev => [{
          id: Date.now(),
          type: importType,
          date: new Date().toISOString(),
          status: 'success',
          records: data.records
        }, ...prev]);
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Import failed. Please try again.' });
      setImportHistory(prev => [{
        id: Date.now(),
        type: importType,
        date: new Date().toISOString(),
        status: 'error',
        records: 0
      }, ...prev]);
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setExportStatus({ type: 'loading', message: 'Preparing export...' });

    try {
      const response = await fetch(`/api/export?type=${exportType}&format=${exportFormat}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget_data_${new Date().toISOString()}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setExportStatus({ type: 'success', message: 'Export completed successfully' });
        setExportHistory(prev => [{
          id: Date.now(),
          type: exportType,
          format: exportFormat,
          date: new Date().toISOString(),
          status: 'success'
        }, ...prev]);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      setExportStatus({ type: 'error', message: 'Export failed. Please try again.' });
      setExportHistory(prev => [{
        id: Date.now(),
        type: exportType,
        format: exportFormat,
        date: new Date().toISOString(),
        status: 'error'
      }, ...prev]);
    }
  };

  const getImportHistoryChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Successful Imports',
          data: last7Days.map(date => 
            importHistory.filter(h => 
              h.date.startsWith(date) && h.status === 'success'
            ).length
          ),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Failed Imports',
          data: last7Days.map(date => 
            importHistory.filter(h => 
              h.date.startsWith(date) && h.status === 'error'
            ).length
          ),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Import/Export Tools</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded ${
              activeTab === 'import' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Import
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded ${
              activeTab === 'export' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Export
          </button>
        </div>
      </div>

      {activeTab === 'import' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Import Data</h2>
              <form onSubmit={handleImport}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data Type</label>
                    <select
                      value={importType}
                      onChange={(e) => setImportType(e.target.value)}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="transactions">Transactions</option>
                      <option value="budgets">Budgets</option>
                      <option value="categories">Categories</option>
                      <option value="goals">Goals</option>
                      <option value="debts">Debts</option>
                    </select>
                  </div>
                  {importStatus && (
                    <div className={`p-4 rounded ${
                      importStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                      importStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {importStatus.message}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={!importFile || importStatus?.type === 'loading'}
                  >
                    Import
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Import History</h2>
              <div className="space-y-4">
                {importHistory.map(record => (
                  <div key={record.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <p className="font-medium">{record.type}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        record.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.records} records
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Import Activity</h2>
            <div className="h-96">
              <Bar data={getImportHistoryChartData()} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Export Data</h2>
              <form onSubmit={handleExport}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data Type</label>
                    <select
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value)}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="all">All Data</option>
                      <option value="transactions">Transactions</option>
                      <option value="budgets">Budgets</option>
                      <option value="categories">Categories</option>
                      <option value="goals">Goals</option>
                      <option value="debts">Debts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  {exportStatus && (
                    <div className={`p-4 rounded ${
                      exportStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                      exportStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {exportStatus.message}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={exportStatus?.type === 'loading'}
                  >
                    Export
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Export History</h2>
              <div className="space-y-4">
                {exportHistory.map(record => (
                  <div key={record.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <p className="font-medium">{record.type}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        record.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.format.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Export Activity</h2>
            <div className="h-96">
              <Bar data={getImportHistoryChartData()} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExport; 