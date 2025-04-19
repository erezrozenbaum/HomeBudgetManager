import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

export default function TransactionTemplate() {
  const downloadTemplate = () => {
    // Create sample data for each transaction type
    const sampleData = [
      // Regular transaction
      {
        type: 'regular',
        date: '2024-03-15',
        amount: 100.00,
        description: 'Grocery shopping',
        category: 'Food',
        subCategory: 'Groceries',
        paymentMethod: 'credit_card'
      },
      // Recurring transaction
      {
        type: 'recurring',
        date: '2024-03-01',
        amount: 1500.00,
        description: 'Monthly rent',
        category: 'Housing',
        subCategory: 'Rent',
        paymentMethod: 'bank_transfer',
        frequency: 'monthly',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true
      },
      // Unplanned transaction
      {
        type: 'unplanned',
        date: '2024-03-10',
        amount: -500.00,
        description: 'Car repair',
        category: 'Transportation',
        subCategory: 'Maintenance',
        paymentMethod: 'debit_card',
        impact: 'negative',
        emergencyLevel: 'high',
        tags: ['emergency', 'car']
      },
      // Business transaction
      {
        type: 'business',
        date: '2024-03-05',
        amount: 2000.00,
        description: 'Client payment',
        category: 'Income',
        subCategory: 'Services',
        paymentMethod: 'bank_transfer',
        business: 'Client Corp',
        transactionType: 'income',
        status: 'completed',
        taxRelated: {
          isDeductible: false,
          taxYear: 2024
        }
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    const wscols = [
      { wch: 10 }, // type
      { wch: 12 }, // date
      { wch: 10 }, // amount
      { wch: 25 }, // description
      { wch: 15 }, // category
      { wch: 15 }, // subCategory
      { wch: 15 }, // paymentMethod
      { wch: 10 }, // frequency
      { wch: 12 }, // startDate
      { wch: 12 }, // endDate
      { wch: 8 },  // isActive
      { wch: 10 }, // impact
      { wch: 15 }, // emergencyLevel
      { wch: 20 }, // tags
      { wch: 15 }, // business
      { wch: 15 }, // transactionType
      { wch: 10 }, // status
      { wch: 20 }  // taxRelated
    ];
    ws['!cols'] = wscols;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Generate Excel file
    XLSX.writeFile(wb, 'transaction_template.xlsx');
  };

  return (
    <button
      onClick={downloadTemplate}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
    >
      <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
      Download Template
    </button>
  );
} 