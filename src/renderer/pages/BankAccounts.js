const React = window.React;
const { useState, useEffect } = React;

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    branch: '',
    currency: 'USD',
    initial_balance: 0
  });

  useEffect(() => {
    // Fetch accounts from local API
    fetch('http://localhost:3000/api/accounts')
      .then(response => response.json())
      .then(data => setAccounts(data))
      .catch(error => console.error('Error fetching accounts:', error));
  }, []);

  const handleAddAccount = (e) => {
    e.preventDefault();
    // Add account to local API
    fetch('http://localhost:3000/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAccount),
    })
      .then(response => response.json())
      .then(data => {
        setAccounts([...accounts, data]);
        setShowAddModal(false);
        setNewAccount({
          name: '',
          branch: '',
          currency: 'USD',
          initial_balance: 0
        });
      })
      .catch(error => console.error('Error adding account:', error));
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-3xl font-bold' }, 'Accounts'),
      React.createElement('button', {
        onClick: () => setShowAddModal(true),
        className: 'bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600'
      }, 'Add Account')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      accounts.map((account) =>
        React.createElement('div', { key: account.id, className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('div', { className: 'flex justify-between items-start' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-xl font-semibold' }, account.name),
              React.createElement('p', { className: 'text-gray-500' }, account.branch)
            ),
            React.createElement('span', { className: 'text-2xl font-bold' },
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: account.currency
              }).format(account.current_balance)
            )
          ),
          React.createElement('div', { className: 'mt-4' },
            React.createElement('p', { className: 'text-sm text-gray-500' }, `Currency: ${account.currency}`),
            React.createElement('p', { className: 'text-sm text-gray-500' }, `Initial Balance: ${account.initial_balance}`)
          )
        )
      )
    ),
    showAddModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'bg-white p-6 rounded-lg w-96' },
        React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Add New Account'),
        React.createElement('form', { onSubmit: handleAddAccount, className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Account Name'),
            React.createElement('input', {
              type: 'text',
              value: newAccount.name,
              onChange: (e) => setNewAccount({ ...newAccount, name: e.target.value }),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Branch'),
            React.createElement('input', {
              type: 'text',
              value: newAccount.branch,
              onChange: (e) => setNewAccount({ ...newAccount, branch: e.target.value }),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Currency'),
            React.createElement('select', {
              value: newAccount.currency,
              onChange: (e) => setNewAccount({ ...newAccount, currency: e.target.value }),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
            },
              React.createElement('option', { value: 'USD' }, 'USD'),
              React.createElement('option', { value: 'EUR' }, 'EUR'),
              React.createElement('option', { value: 'GBP' }, 'GBP')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Initial Balance'),
            React.createElement('input', {
              type: 'number',
              value: newAccount.initial_balance,
              onChange: (e) => setNewAccount({ ...newAccount, initial_balance: parseFloat(e.target.value) }),
              className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
              required: true
            })
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3' },
            React.createElement('button', {
              type: 'button',
              onClick: () => setShowAddModal(false),
              className: 'px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'
            }, 'Cancel'),
            React.createElement('button', {
              type: 'submit',
              className: 'px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600'
            }, 'Add Account')
          )
        )
      )
    )
  );
}

module.exports = Accounts; 