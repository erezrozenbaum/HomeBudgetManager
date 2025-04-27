const React = window.React;
const { useState } = React;
const { Card } = require('../Card');
const { Button } = require('../Button');
const { FormInput } = require('../FormInput');
const { Modal } = require('../Modal');
const { LoadingSpinner } = require('../LoadingSpinner');
const { ipcRenderer } = require('electron');

const TransactionImport = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [importedTransactions, setImportedTransactions] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await ipcRenderer.invoke('import-transactions', file.path);
      setImportedTransactions(result);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement(
    'div',
    null,
    React.createElement(
      Card,
      { className: 'p-6' },
      React.createElement(
        'h2',
        { className: 'text-xl font-bold mb-4' },
        'Import Transactions'
      ),
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          FormInput,
          {
            type: 'file',
            accept: '.xlsx,.csv',
            onChange: handleFileChange,
            label: 'Select File'
          }
        ),
        error && React.createElement(
          'p',
          { className: 'text-red-500' },
          error
        ),
        React.createElement(
          Button,
          {
            onClick: handleImport,
            disabled: isLoading || !file,
            className: 'w-full'
          },
          isLoading ? React.createElement(LoadingSpinner, null) : 'Import Transactions'
        )
      )
    ),
    showModal && React.createElement(
      Modal,
      {
        onClose: () => setShowModal(false),
        title: 'Import Results'
      },
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'p',
          null,
          `Successfully imported ${importedTransactions.length} transactions`
        ),
        React.createElement(
          Button,
          {
            onClick: () => setShowModal(false),
            className: 'w-full'
          },
          'Close'
        )
      )
    )
  );
};

module.exports = { TransactionImport }; 