const React = window.React;
const { useState, useEffect } = React;
const { Card } = require('../Card');
const { Button } = require('../Button');
const { FormInput } = require('../FormInput');
const { AuthSelect } = require('../auth/AuthSelect');
const { AuthCheckbox } = require('../auth/AuthCheckbox');
const { ipcRenderer } = require('electron');

const TransactionForm = ({ transaction, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'regular',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: '',
    subCategory: '',
    paymentMethod: '',
    frequency: '',
    startDate: '',
    endDate: '',
    isActive: true,
    impact: '',
    emergencyLevel: '',
    tags: [],
    business: '',
    transactionType: '',
    status: 'pending',
    taxRelated: {
      isDeductible: false,
      taxYear: new Date().getFullYear()
    }
  });

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = [
    { value: 'food', label: 'Food' },
    { value: 'housing', label: 'Housing' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'income', label: 'Income' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  return React.createElement(
    Card,
    { className: 'p-6' },
    React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'space-y-4' },
      React.createElement(
        'h2',
        { className: 'text-xl font-bold mb-4' },
        transaction ? 'Edit Transaction' : 'Add Transaction'
      ),
      React.createElement(
        AuthSelect,
        {
          label: 'Transaction Type',
          name: 'type',
          value: formData.type,
          onChange: handleChange,
          options: [
            { value: 'regular', label: 'Regular' },
            { value: 'recurring', label: 'Recurring' },
            { value: 'unplanned', label: 'Unplanned' },
            { value: 'business', label: 'Business' }
          ],
          required: true
        }
      ),
      React.createElement(
        FormInput,
        {
          type: 'date',
          name: 'date',
          value: formData.date,
          onChange: handleChange,
          label: 'Date',
          required: true
        }
      ),
      React.createElement(
        FormInput,
        {
          type: 'number',
          name: 'amount',
          value: formData.amount,
          onChange: handleChange,
          label: 'Amount',
          required: true
        }
      ),
      React.createElement(
        FormInput,
        {
          type: 'text',
          name: 'description',
          value: formData.description,
          onChange: handleChange,
          label: 'Description',
          required: true
        }
      ),
      React.createElement(
        AuthSelect,
        {
          label: 'Category',
          name: 'category',
          value: formData.category,
          onChange: handleChange,
          options: categories,
          required: true
        }
      ),
      React.createElement(
        AuthSelect,
        {
          label: 'Payment Method',
          name: 'paymentMethod',
          value: formData.paymentMethod,
          onChange: handleChange,
          options: paymentMethods,
          required: true
        }
      ),
      formData.type === 'recurring' && React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          AuthSelect,
          {
            label: 'Frequency',
            name: 'frequency',
            value: formData.frequency,
            onChange: handleChange,
            options: [
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' }
            ],
            required: true
          }
        ),
        React.createElement(
          FormInput,
          {
            type: 'date',
            name: 'startDate',
            value: formData.startDate,
            onChange: handleChange,
            label: 'Start Date',
            required: true
          }
        ),
        React.createElement(
          FormInput,
          {
            type: 'date',
            name: 'endDate',
            value: formData.endDate,
            onChange: handleChange,
            label: 'End Date'
          }
        ),
        React.createElement(
          AuthCheckbox,
          {
            name: 'isActive',
            checked: formData.isActive,
            onChange: handleChange,
            label: 'Active'
          }
        )
      ),
      formData.type === 'unplanned' && React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          AuthSelect,
          {
            label: 'Impact',
            name: 'impact',
            value: formData.impact,
            onChange: handleChange,
            options: [
              { value: 'positive', label: 'Positive' },
              { value: 'negative', label: 'Negative' },
              { value: 'neutral', label: 'Neutral' }
            ],
            required: true
          }
        ),
        React.createElement(
          AuthSelect,
          {
            label: 'Emergency Level',
            name: 'emergencyLevel',
            value: formData.emergencyLevel,
            onChange: handleChange,
            options: [
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ],
            required: true
          }
        )
      ),
      formData.type === 'business' && React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          FormInput,
          {
            type: 'text',
            name: 'business',
            value: formData.business,
            onChange: handleChange,
            label: 'Business Name',
            required: true
          }
        ),
        React.createElement(
          AuthSelect,
          {
            label: 'Transaction Type',
            name: 'transactionType',
            value: formData.transactionType,
            onChange: handleChange,
            options: [
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
              { value: 'investment', label: 'Investment' }
            ],
            required: true
          }
        ),
        React.createElement(
          AuthCheckbox,
          {
            name: 'taxRelated.isDeductible',
            checked: formData.taxRelated.isDeductible,
            onChange: (e) => {
              setFormData(prev => ({
                ...prev,
                taxRelated: {
                  ...prev.taxRelated,
                  isDeductible: e.target.checked
                }
              }));
            },
            label: 'Tax Deductible'
          }
        )
      ),
      React.createElement(
        'div',
        { className: 'flex justify-end space-x-4' },
        React.createElement(
          Button,
          {
            type: 'button',
            onClick: onCancel,
            className: 'bg-gray-500 hover:bg-gray-600'
          },
          'Cancel'
        ),
        React.createElement(
          Button,
          {
            type: 'submit',
            className: 'bg-blue-500 hover:bg-blue-600'
          },
          transaction ? 'Update' : 'Add'
        )
      )
    )
  );
};

module.exports = { TransactionForm }; 