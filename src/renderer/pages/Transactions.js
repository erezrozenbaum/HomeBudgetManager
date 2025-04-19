import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import RegularTransactions from '../components/transactions/RegularTransactions';
import RecurringTransactions from '../components/transactions/RecurringTransactions';
import UnplannedTransactions from '../components/transactions/UnplannedTransactions';
import BusinessTransactions from '../components/transactions/BusinessTransactions';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionImport from '../components/transactions/TransactionImport';
import TransactionTemplate from '../components/transactions/TransactionTemplate';
import { useAuth } from '../contexts/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Transactions() {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <div className="flex space-x-4">
              <TransactionTemplate />
              <button
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                Import
              </button>
              <button
                onClick={() => handleAddTransaction('regular')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Transaction
              </button>
            </div>
          </div>

          <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 shadow">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-700 hover:bg-gray-100'
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-4">
              {tabs.map((tab, idx) => (
                <Tab.Panel
                  key={idx}
                  className={classNames(
                    'rounded-xl bg-white p-3',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                  )}
                >
                  <tab.component />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {isFormOpen && (
        <TransactionForm
          type={transactionType}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {isImportOpen && (
        <TransactionImport
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
        />
      )}
    </div>
  );
} 