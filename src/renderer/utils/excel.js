import * as XLSX from 'xlsx';
import { validateDate, validateAmount, validateCurrency } from './validation';

// Schema definitions for different data types
const SCHEMAS = {
  transactions: {
    required: ['description', 'amount', 'currency', 'date', 'type', 'category'],
    optional: ['is_recurring', 'is_unplanned', 'is_entitlement', 'bank_account_id', 'credit_card_id'],
    validators: {
      amount: validateAmount,
      currency: validateCurrency,
      date: validateDate,
    },
  },
  investments: {
    required: ['name', 'type', 'amount', 'currency', 'purchase_date', 'current_value'],
    optional: ['linked_goal_id', 'linked_business_id', 'notes'],
    validators: {
      amount: validateAmount,
      currency: validateCurrency,
      purchase_date: validateDate,
      current_value: validateAmount,
    },
  },
  loans: {
    required: ['name', 'amount', 'currency', 'monthly_payment', 'interest_rate', 'duration_months', 'start_date', 'end_date', 'source'],
    optional: [],
    validators: {
      amount: validateAmount,
      currency: validateCurrency,
      monthly_payment: validateAmount,
      interest_rate: validateAmount,
      start_date: validateDate,
      end_date: validateDate,
    },
  },
  insurances: {
    required: ['name', 'provider', 'type', 'category', 'premium_amount', 'currency', 'payment_frequency', 'coverage_period_start'],
    optional: ['coverage_period_end', 'notes'],
    validators: {
      premium_amount: validateAmount,
      currency: validateCurrency,
      coverage_period_start: validateDate,
      coverage_period_end: validateDate,
    },
  },
};

// Export data to Excel
export function exportToExcel(data, type) {
  try {
    // Get schema for the data type
    const schema = SCHEMAS[type];
    if (!schema) {
      throw new Error(`Invalid data type: ${type}`);
    }

    // Prepare worksheet data
    const worksheetData = data.map(item => {
      const row = {};
      // Include all required and optional fields
      [...schema.required, ...schema.optional].forEach(field => {
        row[field] = item[field] || '';
      });
      return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return excelBuffer;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

// Import data from Excel
export function importFromExcel(file, type) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Validate data against schema
          const schema = SCHEMAS[type];
          if (!schema) {
            throw new Error(`Invalid data type: ${type}`);
          }

          const validatedData = jsonData.map((item, index) => {
            // Check required fields
            const missingFields = schema.required.filter(field => !item[field]);
            if (missingFields.length > 0) {
              throw new Error(`Missing required fields in row ${index + 2}: ${missingFields.join(', ')}`);
            }

            // Validate fields
            const errors = [];
            Object.entries(schema.validators).forEach(([field, validator]) => {
              if (item[field] && !validator(item[field])) {
                errors.push(`Invalid ${field} in row ${index + 2}`);
              }
            });

            if (errors.length > 0) {
              throw new Error(errors.join('\n'));
            }

            // Convert date strings to ISO format
            if (item.date) {
              item.date = new Date(item.date).toISOString().split('T')[0];
            }
            if (item.purchase_date) {
              item.purchase_date = new Date(item.purchase_date).toISOString().split('T')[0];
            }
            if (item.start_date) {
              item.start_date = new Date(item.start_date).toISOString().split('T')[0];
            }
            if (item.end_date) {
              item.end_date = new Date(item.end_date).toISOString().split('T')[0];
            }
            if (item.coverage_period_start) {
              item.coverage_period_start = new Date(item.coverage_period_start).toISOString().split('T')[0];
            }
            if (item.coverage_period_end) {
              item.coverage_period_end = new Date(item.coverage_period_end).toISOString().split('T')[0];
            }

            // Convert boolean strings to actual booleans
            if (item.is_recurring !== undefined) {
              item.is_recurring = item.is_recurring === 'true' || item.is_recurring === true;
            }
            if (item.is_unplanned !== undefined) {
              item.is_unplanned = item.is_unplanned === 'true' || item.is_unplanned === true;
            }
            if (item.is_entitlement !== undefined) {
              item.is_entitlement = item.is_entitlement === 'true' || item.is_entitlement === true;
            }

            return item;
          });

          resolve(validatedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });
}

// Download Excel file
export function downloadExcel(data, type) {
  try {
    const excelBuffer = exportToExcel(data, type);
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    throw error;
  }
}

// Get Excel template for a specific type
export function getExcelTemplate(type) {
  const schema = SCHEMAS[type];
  if (!schema) {
    throw new Error(`Invalid data type: ${type}`);
  }

  // Create template with headers
  const template = [schema.required.concat(schema.optional)];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(template);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, type);

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return excelBuffer;
}

// Download Excel template
export function downloadExcelTemplate(type) {
  try {
    const excelBuffer = getExcelTemplate(type);
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading Excel template:', error);
    throw error;
  }
} 