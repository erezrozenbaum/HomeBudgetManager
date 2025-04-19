import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TestCoverage = () => {
  const [coverage, setCoverage] = useState({
    overall: 0,
    statements: 0,
    branches: 0,
    functions: 0,
    lines: 0,
    history: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);

  useEffect(() => {
    fetchCoverage();
  }, []);

  const fetchCoverage = async () => {
    try {
      const response = await fetch('/api/coverage');
      const data = await response.json();
      setCoverage(data);
    } catch (error) {
      console.error('Error fetching coverage data:', error);
    }
  };

  const fetchFileDetails = async (filePath) => {
    try {
      const response = await fetch(`/api/coverage/files/${encodeURIComponent(filePath)}`);
      const data = await response.json();
      setFileDetails(data);
    } catch (error) {
      console.error('Error fetching file details:', error);
    }
  };

  const coverageHistoryData = {
    labels: coverage.history.map(h => new Date(h.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Overall Coverage',
        data: coverage.history.map(h => h.overall),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const getCoverageColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Test Coverage Reports</h1>
        <button
          onClick={fetchCoverage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Overall Coverage</h3>
          <p className={`text-2xl font-bold ${getCoverageColor(coverage.overall)} p-2 rounded`}>
            {coverage.overall}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Statements</h3>
          <p className={`text-2xl font-bold ${getCoverageColor(coverage.statements)} p-2 rounded`}>
            {coverage.statements}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Branches</h3>
          <p className={`text-2xl font-bold ${getCoverageColor(coverage.branches)} p-2 rounded`}>
            {coverage.branches}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Functions</h3>
          <p className={`text-2xl font-bold ${getCoverageColor(coverage.functions)} p-2 rounded`}>
            {coverage.functions}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Coverage History</h2>
          <Line data={coverageHistoryData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">File Coverage</h2>
          <div className="space-y-2">
            {coverage.files?.map((file) => (
              <div
                key={file.path}
                className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedFile(file.path);
                  fetchFileDetails(file.path);
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{file.path}</span>
                  <span className={`text-sm ${getCoverageColor(file.coverage)} px-2 py-1 rounded`}>
                    {file.coverage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {fileDetails && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">File Details: {selectedFile}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Line
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fileDetails.lines.map((line) => (
                  <tr key={line.number}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {line.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          line.hits > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {line.hits > 0 ? 'Covered' : 'Uncovered'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {line.code}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCoverage; 