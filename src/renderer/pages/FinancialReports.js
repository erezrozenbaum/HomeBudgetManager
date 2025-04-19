import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 6)), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [reports, setReports] = useState({
    income: [],
    expenses: [],
    categories: [],
    trends: [],
    netWorth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?start=${dateRange.start}&end=${dateRange.end}`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const incomeChartData = {
    labels: reports.income.map(item => format(new Date(item.date), 'MMM yyyy')),
    datasets: [
      {
        label: 'Income',
        data: reports.income.map(item => item.amount),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const expensesChartData = {
    labels: reports.expenses.map(item => format(new Date(item.date), 'MMM yyyy')),
    datasets: [
      {
        label: 'Expenses',
        data: reports.expenses.map(item => item.amount),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const categoryDistributionData = {
    labels: reports.categories.map(item => item.name),
    datasets: [
      {
        data: reports.categories.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }
    ]
  };

  const netWorthData = {
    labels: reports.netWorth.map(item => format(new Date(item.date), 'MMM yyyy')),
    datasets: [
      {
        label: 'Net Worth',
        data: reports.netWorth.map(item => item.amount),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1
      }
    ]
  };

  const exportReport = async (format) => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}&start=${dateRange.start}&end=${dateRange.end}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="flex space-x-4">
          <select
            className="border rounded px-3 py-2"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="overview">Overview</option>
            <option value="income">Income</option>
            <option value="expenses">Expenses</option>
            <option value="net-worth">Net Worth</option>
          </select>
          <div className="flex space-x-2">
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => exportReport('pdf')}
            >
              Export PDF
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => exportReport('csv')}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'overview' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
                <Line data={incomeChartData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
                <Pie data={categoryDistributionData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Net Worth Trend</h2>
                <Line data={netWorthData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Monthly Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Total Income</h3>
                    <p className="text-2xl font-bold text-green-600">
                      ${reports.income.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600">
                      ${reports.expenses.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'income' && (
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Income Analysis</h2>
              <Line data={incomeChartData} />
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Income Sources</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Source</th>
                        <th className="px-4 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.income.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-4 py-2">{format(new Date(item.date), 'MMM d, yyyy')}</td>
                          <td className="px-4 py-2">{item.source}</td>
                          <td className="px-4 py-2">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Expenses Analysis</h2>
              <Line data={expensesChartData} />
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Expense Categories</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.categories.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">${item.amount.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'net-worth' && (
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Net Worth Analysis</h2>
              <Line data={netWorthData} />
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Net Worth History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Assets</th>
                        <th className="px-4 py-2">Liabilities</th>
                        <th className="px-4 py-2">Net Worth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.netWorth.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-4 py-2">{format(new Date(item.date), 'MMM d, yyyy')}</td>
                          <td className="px-4 py-2">${item.assets.toFixed(2)}</td>
                          <td className="px-4 py-2">${item.liabilities.toFixed(2)}</td>
                          <td className="px-4 py-2">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialReports; 