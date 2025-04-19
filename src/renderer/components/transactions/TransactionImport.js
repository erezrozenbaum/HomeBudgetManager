import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

export default function TransactionImport({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const validateTransaction = (row, index) => {
    const errors = [];
    
    // Required fields for all transactions
    if (!row.date) errors.push(`Row ${index + 2}: Date is required`);
    if (!row.amount) errors.push(`Row ${index + 2}: Amount is required`);
    if (!row.description) errors.push(`Row ${index + 2}: Description is required`);
    if (!row.category) errors.push(`Row ${index + 2}: Category is required`);

    // Validate transaction type
    if (row.type) {
      const validTypes = ['regular', 'recurring', 'unplanned', 'business'];
      if (!validTypes.includes(row.type.toLowerCase())) {
        errors.push(`Row ${index + 2}: Invalid transaction type. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Validate recurring transaction fields
    if (row.type?.toLowerCase() === 'recurring') {
      if (!row.frequency) errors.push(`Row ${index + 2}: Frequency is required for recurring transactions`);
      if (!row.startDate) errors.push(`Row ${index + 2}: Start date is required for recurring transactions`);
    }

    // Validate unplanned transaction fields
    if (row.type?.toLowerCase() === 'unplanned') {
      if (!row.impact) errors.push(`Row ${index + 2}: Impact is required for unplanned transactions`);
      if (!row.emergencyLevel) errors.push(`Row ${index + 2}: Emergency level is required for unplanned transactions`);
    }

    // Validate business transaction fields
    if (row.type?.toLowerCase() === 'business') {
      if (!row.business) errors.push(`Row ${index + 2}: Business is required for business transactions`);
      if (!row.transactionType) errors.push(`Row ${index + 2}: Transaction type is required for business transactions`);
    }

    return errors;
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        const errors = [];
        const validTransactions = [];

        rows.forEach((row, index) => {
          const rowErrors = validateTransaction(row, index);
          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          } else {
            validTransactions.push(row);
          }
        });

        if (errors.length > 0) {
          setError(errors.join('\n'));
          return;
        }

        // Group transactions by type
        const groupedTransactions = {
          regular: [],
          recurring: [],
          unplanned: [],
          business: []
        };

        validTransactions.forEach(transaction => {
          const type = transaction.type?.toLowerCase() || 'regular';
          groupedTransactions[type].push(transaction);
        });

        // Import each type of transaction
        for (const [type, transactions] of Object.entries(groupedTransactions)) {
          if (transactions.length > 0) {
            const response = await fetch(`/api/transactions/${type}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(transactions),
            });

            if (!response.ok) {
              throw new Error(`Failed to import ${type} transactions`);
            }
          }
        }

        setSuccess(`Successfully imported ${validTransactions.length} transactions`);
        setFile(null);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">
              Import Transactions
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  Select Excel File
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  {file ? file.name : 'No file selected'}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p className="font-medium mb-2">Excel Template Format:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Common fields: date, amount, description, category, subCategory, paymentMethod</li>
                <li>Recurring transactions: frequency, startDate, endDate, isActive</li>
                <li>Unplanned transactions: impact, emergencyLevel, tags</li>
                <li>Business transactions: business, transactionType, status, taxRelated</li>
              </ul>
            </div>

            {error && (
              <div className="text-red-500 text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-500 text-sm">
                {success}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 