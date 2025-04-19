import React, { useState } from 'react';

const AIFinancialAdvisor = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const prebuiltQueries = [
    {
      id: 1,
      question: 'What are my spending trends?',
      category: 'Spending'
    },
    {
      id: 2,
      question: 'How can I save more money?',
      category: 'Savings'
    },
    {
      id: 3,
      question: 'What are my investment opportunities?',
      category: 'Investments'
    }
  ];

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResponse({
        insights: [
          'Your monthly expenses have increased by 15% compared to last month.',
          'You have saved 20% of your income this month, which is above your target.',
          'Consider investing in index funds for long-term growth.'
        ],
        recommendations: [
          'Review your entertainment expenses as they have increased significantly.',
          'Set up automatic transfers to your savings account.',
          'Diversify your investment portfolio.'
        ]
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">AI Financial Advisor</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('insights')}
              className={`${
                activeTab === 'insights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('predictions')}
              className={`${
                activeTab === 'predictions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Predictions
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prebuiltQueries.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setQuery(item.question)}
                    className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="text-sm text-gray-500">{item.category}</span>
                    <p className="mt-1 font-medium">{item.question}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleQuerySubmit} className="space-y-4">
                <div>
                  <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                    Ask a question
                  </label>
                  <textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                    placeholder="Type your question here..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Get Insights'}
                </button>
              </form>

              {response && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Insights</h3>
                    <div className="space-y-4">
                      {response.insights.map((insight, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-800">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-4">
                      {response.recommendations.map((recommendation, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg">
                          <p className="text-green-800">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Predictions</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Next Month</p>
                      <p className="text-2xl font-bold">$3,500</p>
                      <p className="text-sm text-red-600">+5% from current</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Quarter</p>
                      <p className="text-2xl font-bold">$10,500</p>
                      <p className="text-sm text-red-600">+8% from current</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Savings Predictions</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Next Month</p>
                      <p className="text-2xl font-bold">$1,200</p>
                      <p className="text-sm text-green-600">+10% from current</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Quarter</p>
                      <p className="text-2xl font-bold">$3,600</p>
                      <p className="text-sm text-green-600">+15% from current</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Predictions</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Portfolio Growth (1 Year)</p>
                    <p className="text-2xl font-bold">12.5%</p>
                    <p className="text-sm text-green-600">Based on current trends</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recommended Allocation</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span>Stocks</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonds</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFinancialAdvisor; 