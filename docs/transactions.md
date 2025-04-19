# Transaction Management Guide

## Overview
The Budget Manager application provides comprehensive transaction management capabilities, supporting four types of transactions:
1. Regular Transactions
2. Recurring Transactions
3. Unplanned Transactions
4. Business Transactions

## Regular Transactions
Regular transactions are your day-to-day financial activities.

### Features
- Basic transaction details (date, amount, description)
- Category and subcategory classification
- Payment method tracking
- Transaction history

### Usage
1. Click "Add Transaction" to create a new regular transaction
2. Fill in the required fields:
   - Date
   - Amount
   - Description
   - Category
   - Payment Method
3. Optional fields:
   - Subcategory
   - Notes
   - Tags

## Recurring Transactions
Recurring transactions are regular payments that occur at fixed intervals.

### Features
- Automatic transaction generation
- Frequency settings (daily, weekly, monthly, etc.)
- Start and end date management
- Active/inactive status

### Usage
1. Click "Add Transaction" and select "Recurring"
2. Fill in the required fields:
   - Date
   - Amount
   - Description
   - Category
   - Frequency
   - Start Date
3. Optional fields:
   - End Date
   - Notes
   - Tags

## Unplanned Transactions
Unplanned transactions help track unexpected expenses or income.

### Features
- Impact assessment (positive, negative, neutral)
- Emergency level classification
- Tagging system
- Analysis and reporting

### Usage
1. Click "Add Transaction" and select "Unplanned"
2. Fill in the required fields:
   - Date
   - Amount
   - Description
   - Category
   - Impact
   - Emergency Level
3. Optional fields:
   - Tags
   - Notes

## Business Transactions
Business transactions help manage business-related financial activities.

### Features
- Business association
- Transaction type classification
- Tax-related information
- Document attachment
- Status tracking

### Usage
1. Click "Add Transaction" and select "Business"
2. Fill in the required fields:
   - Date
   - Amount
   - Description
   - Category
   - Business
   - Transaction Type
3. Optional fields:
   - Tax-related information
   - Documents
   - Notes
   - Tags

## Importing Transactions
You can import transactions in bulk using Excel files.

### Steps
1. Click "Download Template" to get a sample Excel file
2. Fill in your transaction data following the template format
3. Click "Import" and select your Excel file
4. The system will validate and import your transactions

### Excel Template Format
The template includes columns for all transaction types:
- Common fields: date, amount, description, category, subCategory, paymentMethod
- Recurring transactions: frequency, startDate, endDate, isActive
- Unplanned transactions: impact, emergencyLevel, tags
- Business transactions: business, transactionType, status, taxRelated

### Validation Rules
- All transactions require: date, amount, description, category
- Recurring transactions require: frequency, startDate
- Unplanned transactions require: impact, emergencyLevel
- Business transactions require: business, transactionType

## Best Practices
1. **Regular Transactions**
   - Keep descriptions clear and consistent
   - Use appropriate categories for better reporting
   - Add notes for important transactions

2. **Recurring Transactions**
   - Set appropriate frequencies
   - Review and update end dates as needed
   - Monitor active status

3. **Unplanned Transactions**
   - Assess impact accurately
   - Use appropriate emergency levels
   - Add relevant tags for tracking

4. **Business Transactions**
   - Keep business information up to date
   - Maintain proper tax documentation
   - Track transaction status regularly

## Troubleshooting
1. **Import Issues**
   - Check Excel file format
   - Verify required fields are filled
   - Ensure date formats are correct
   - Check for duplicate transactions

2. **Transaction Errors**
   - Verify all required fields
   - Check date formats
   - Ensure amount is numeric
   - Validate category names

3. **Recurring Transaction Issues**
   - Check frequency settings
   - Verify start and end dates
   - Ensure active status is correct

## Support
For additional help:
1. Check the FAQ section
2. Contact support through the Help & Support page
3. Review the application documentation 