const React = window.React;
const { useState } = React;
const { downloadExcel, downloadExcelTemplate, importFromExcel } = require('../utils/excel');
const { Button } = require('./Button');
const { Modal } = require('./Modal');

const ExcelOperations = ({ type, onImport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleExport = async () => {
    try {
      await downloadExcel(type);
      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadExcelTemplate(type);
      setSuccess('Template downloaded successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file, type);
      onImport(data);
      setSuccess('Data imported successfully');
      setTimeout(() => setSuccess(null), 3000);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  return React.createElement(
    'div',
    { className: 'space-y-4' },
    React.createElement(
      'div',
      { className: 'flex space-x-4' },
      React.createElement(
        Button,
        { onClick: handleExport, variant: 'primary' },
        'Export to Excel'
      ),
      React.createElement(
        Button,
        { onClick: () => setIsModalOpen(true), variant: 'secondary' },
        'Import from Excel'
      ),
      React.createElement(
        Button,
        { onClick: handleDownloadTemplate, variant: 'outline' },
        'Download Template'
      )
    ),
    error && React.createElement(
      'div',
      { className: 'p-4 bg-red-100 border border-red-400 text-red-700 rounded' },
      error
    ),
    success && React.createElement(
      'div',
      { className: 'p-4 bg-green-100 border border-green-400 text-green-700 rounded' },
      success
    ),
    React.createElement(
      Modal,
      {
        isOpen: isModalOpen,
        onClose: () => setIsModalOpen(false),
        title: 'Import from Excel'
      },
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'p',
          { className: 'text-gray-600' },
          'Please select an Excel file to import. Make sure it follows the template format.'
        ),
        React.createElement(
          'div',
          { className: 'flex items-center space-x-4' },
          React.createElement('input', {
            type: 'file',
            accept: '.xlsx,.xls',
            onChange: handleImport,
            className: `
              block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            `
          })
        ),
        React.createElement(
          'div',
          { className: 'flex justify-end' },
          React.createElement(
            Button,
            { onClick: () => setIsModalOpen(false), variant: 'outline' },
            'Cancel'
          )
        )
      )
    )
  );
};

module.exports = { ExcelOperations }; 