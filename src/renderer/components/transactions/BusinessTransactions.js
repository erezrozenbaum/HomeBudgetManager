const React = window.React;
const { useState, useEffect } = React;
const { Card } = require('../Card');
const { Button } = require('../Button');
const { TransactionTemplate } = require('./TransactionTemplate');
const { Modal } = require('../Modal');
const { TransactionForm } = require('./TransactionForm');
const { ipcRenderer } = require('electron');

const BusinessTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const result = await ipcRenderer.invoke('get-business-transactions');
      setTransactions(result);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedTransaction(null);
    setShowModal(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await ipcRenderer.invoke('delete-transaction', id);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedTransaction) {
        await ipcRenderer.invoke('update-transaction', {
          ...formData,
          id: selectedTransaction.id
        });
      } else {
        await ipcRenderer.invoke('add-transaction', formData);
      }
      setShowModal(false);
      loadTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return React.createElement(
    'div',
    { className: 'space-y-4' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center' },
      React.createElement(
        'h1',
        { className: 'text-2xl font-bold' },
        'Business Transactions'
      ),
      React.createElement(
        Button,
        {
          onClick: handleAdd,
          className: 'bg-blue-500 hover:bg-blue-600'
        },
        'Add Transaction'
      )
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
      transactions.map(transaction => 
        React.createElement(
          TransactionTemplate,
          {
            key: transaction.id,
            transaction,
            onEdit: () => handleEdit(transaction),
            onDelete: () => handleDelete(transaction.id)
          }
        )
      )
    ),
    showModal && React.createElement(
      Modal,
      {
        onClose: () => setShowModal(false),
        title: selectedTransaction ? 'Edit Transaction' : 'Add Transaction'
      },
      React.createElement(
        TransactionForm,
        {
          transaction: selectedTransaction,
          onSubmit: handleSubmit,
          onCancel: () => setShowModal(false)
        }
      )
    )
  );
};

module.exports = { BusinessTransactions }; 