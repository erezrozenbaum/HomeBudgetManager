import React, { useState } from 'react';

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('bank');
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      type: 'bank',
      name: 'Main Account',
      balance: 5000.00,
      currency: 'USD',
      color: '#3B82F6'
    },
    {
      id: 2,
      type: 'credit',
      name: 'Credit Card',
      balance: -1000.00,
      limit: 5000.00,
      dueDate: '2024-03-15',
      color: '#10B981'
    }
  ]);

  const BankAccountCard = ({ account }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: account.color }}
          />
          <h3 className="text-lg font-semibold">{account.name}</h3>
        </div>
        <span className="text-sm text-gray-500">{account.currency}</span>
      </div>
      <div className="text-2xl font-bold mb-2">
        {account.balance >= 0 ? '+' : ''}{account.balance.toFixed(2)}
      </div>
      <div className="flex justify-end space-x-2">
        <button className="text-blue-600 hover:text-blue-800">Edit</button>
        <button className="text-red-600 hover:text-red-800">Delete</button>
      </div>
    </div>
  );

  const CreditCardCard = ({ account }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: account.color }}
          />
          <h3 className="text-lg font-semibold">{account.name}</h3>
        </div>
        <span className="text-sm text-gray-500">Due: {account.dueDate}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Balance</span>
          <span className="text-red-600">{account.balance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Credit Limit</span>
          <span>{account.limit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Available</span>
          <span className="text-green-600">
            {(account.limit + account.balance).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button className="text-blue-600 hover:text-blue-800">Edit</button>
        <button className="text-red-600 hover:text-red-800">Delete</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Add Account
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('bank')}
              className={`${
                activeTab === 'bank'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Bank Accounts
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`${
                activeTab === 'credit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Credit Cards
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'bank' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts
                .filter((account) => account.type === 'bank')
                .map((account) => (
                  <BankAccountCard key={account.id} account={account} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts
                .filter((account) => account.type === 'credit')
                .map((account) => (
                  <CreditCardCard key={account.id} account={account} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounts; 