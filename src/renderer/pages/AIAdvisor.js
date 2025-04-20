import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AIAdvisor = () => {
  const { user } = useAuth();
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const getFinancialAdvice = async () => {
    setLoading(true);
    try {
      // TODO: Implement AI advice generation
      setAdvice('Financial advice will be generated here...');
    } catch (error) {
      console.error('Error getting financial advice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Financial Advisor</h1>
      <button
        onClick={getFinancialAdvice}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Generating Advice...' : 'Get Financial Advice'}
      </button>
      {advice && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>{advice}</p>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor; 