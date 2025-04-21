import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import ExcelJS from 'exceljs';

export default function TransactionTemplate() {
  const downloadTemplate = async () => {
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

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // Add headers
    const headers = Object.keys(sampleData.reduce((acc, curr) => {
      Object.keys(curr).forEach(key => {
        acc[key] = true;
      });
      return acc;
    }, {}));
    worksheet.addRow(headers);

    // Add data
    sampleData.forEach(data => {
      const row = headers.map(header => {
        const value = data[header];
        if (Array.isArray(value)) {
          return value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      });
      worksheet.addRow(row);
    });

    // Set column widths
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction_template.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
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