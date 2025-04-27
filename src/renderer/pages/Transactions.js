const React = window.React;
const { useState } = React;
const { Tab } = require('@headlessui/react');
const { PlusIcon, ArrowPathIcon } = require('@heroicons/react/24/outline');
const RegularTransactions = require('../components/transactions/RegularTransactions').default;
const RecurringTransactions = require('../components/transactions/RecurringTransactions').default;
const UnplannedTransactions = require('../components/transactions/UnplannedTransactions').default;
const BusinessTransactions = require('../components/transactions/BusinessTransactions').default;
const TransactionForm = require('../components/transactions/TransactionForm').default;
const TransactionImport = require('../components/transactions/TransactionImport').default;
const TransactionTemplate = require('../components/transactions/TransactionTemplate').default;
const { useAuth } = require('../contexts/AuthContext');

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Transactions() {
  const [activeTab, setActiveTab] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('regular');
  const { user } = useAuth();

  const tabs = [
    { name: 'Regular', component: RegularTransactions },
    { name: 'Recurring', component: RecurringTransactions },
    { name: 'Unplanned', component: UnplannedTransactions },
    { name: 'Business', component: BusinessTransactions }
  ];

  const handleAddTransaction = (type) => {
    setTransactionType(type);
    setIsFormOpen(true);
  };

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-100' },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8' },
      React.createElement(
        'div',
        { className: 'px-4 py-6 sm:px-0' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-center mb-6' },
          React.createElement(
            'h1',
            { className: 'text-3xl font-bold text-gray-900' },
            'Transactions'
          ),
          React.createElement(
            'div',
            { className: 'flex space-x-4' },
            React.createElement(TransactionTemplate),
            React.createElement(
              'button',
              {
                onClick: () => setIsImportOpen(true),
                className: 'inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              },
              React.createElement(ArrowPathIcon, { className: '-ml-1 mr-2 h-5 w-5' }),
              'Import'
            ),
            React.createElement(
              'button',
              {
                onClick: () => handleAddTransaction('regular'),
                className: 'inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              },
              React.createElement(PlusIcon, { className: '-ml-1 mr-2 h-5 w-5' }),
              'Add Transaction'
            )
          )
        ),
        React.createElement(
          Tab.Group,
          { selectedIndex: activeTab, onChange: setActiveTab },
          React.createElement(
            Tab.List,
            { className: 'flex space-x-1 rounded-xl bg-white p-1 shadow' },
            tabs.map((tab) =>
              React.createElement(
                Tab,
                {
                  key: tab.name,
                  className: ({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-700 hover:bg-gray-100'
                    )
                },
                tab.name
              )
            )
          ),
          React.createElement(
            Tab.Panels,
            { className: 'mt-4' },
            tabs.map((tab, idx) =>
              React.createElement(
                Tab.Panel,
                {
                  key: idx,
                  className: classNames(
                    'rounded-xl bg-white p-3',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                  )
                },
                React.createElement(tab.component)
              )
            )
          )
        )
      )
    ),
    isFormOpen && React.createElement(TransactionForm, {
      type: transactionType,
      isOpen: isFormOpen,
      onClose: () => setIsFormOpen(false)
    }),
    isImportOpen && React.createElement(TransactionImport, {
      isOpen: isImportOpen,
      onClose: () => setIsImportOpen(false)
    })
  );
}

module.exports = { Transactions }; 