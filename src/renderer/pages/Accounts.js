const React = window.React;
const { useState } = React;

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

  const BankAccountCard = ({ account }) => React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center' },
        React.createElement('div', {
          className: 'w-4 h-4 rounded-full mr-2',
          style: { backgroundColor: account.color }
        }),
        React.createElement('h3', { className: 'text-lg font-semibold' }, account.name)
      ),
      React.createElement('span', { className: 'text-sm text-gray-500' }, account.currency)
    ),
    React.createElement('div', { className: 'text-2xl font-bold mb-2' },
      `${account.balance >= 0 ? '+' : ''}${account.balance.toFixed(2)}`
    ),
    React.createElement('div', { className: 'flex justify-end space-x-2' },
      React.createElement('button', { className: 'text-blue-600 hover:text-blue-800' }, 'Edit'),
      React.createElement('button', { className: 'text-red-600 hover:text-red-800' }, 'Delete')
    )
  );

  const CreditCardCard = ({ account }) => React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center' },
        React.createElement('div', {
          className: 'w-4 h-4 rounded-full mr-2',
          style: { backgroundColor: account.color }
        }),
        React.createElement('h3', { className: 'text-lg font-semibold' }, account.name)
      ),
      React.createElement('span', { className: 'text-sm text-gray-500' }, `Due: ${account.dueDate}`)
    ),
    React.createElement('div', { className: 'space-y-2' },
      React.createElement('div', { className: 'flex justify-between' },
        React.createElement('span', { className: 'text-gray-600' }, 'Balance'),
        React.createElement('span', { className: 'text-red-600' }, account.balance.toFixed(2))
      ),
      React.createElement('div', { className: 'flex justify-between' },
        React.createElement('span', { className: 'text-gray-600' }, 'Credit Limit'),
        React.createElement('span', null, account.limit.toFixed(2))
      ),
      React.createElement('div', { className: 'flex justify-between' },
        React.createElement('span', { className: 'text-gray-600' }, 'Available'),
        React.createElement('span', { className: 'text-green-600' },
          (account.limit + account.balance).toFixed(2)
        )
      )
    ),
    React.createElement('div', { className: 'flex justify-end space-x-2 mt-4' },
      React.createElement('button', { className: 'text-blue-600 hover:text-blue-800' }, 'Edit'),
      React.createElement('button', { className: 'text-red-600 hover:text-red-800' }, 'Delete')
    )
  );

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800' }, 'Accounts'),
      React.createElement('button', {
        className: 'bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
      }, 'Add Account')
    ),
    React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
      React.createElement('div', { className: 'border-b border-gray-200' },
        React.createElement('nav', { className: '-mb-px flex space-x-8' },
          React.createElement('button', {
            onClick: () => setActiveTab('bank'),
            className: `${
              activeTab === 'bank'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
          }, 'Bank Accounts'),
          React.createElement('button', {
            onClick: () => setActiveTab('credit'),
            className: `${
              activeTab === 'credit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
          }, 'Credit Cards')
        )
      ),
      React.createElement('div', { className: 'mt-6' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          accounts
            .filter(account => account.type === activeTab)
            .map(account =>
              account.type === 'bank'
                ? React.createElement(BankAccountCard, { key: account.id, account })
                : React.createElement(CreditCardCard, { key: account.id, account })
            )
        )
      )
    )
  );
};

module.exports = Accounts; 