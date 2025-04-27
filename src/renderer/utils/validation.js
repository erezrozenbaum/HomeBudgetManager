function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  if (!password) return false;
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function validateCreditCardNumber(number) {
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

function validateCurrency(currency) {
  if (!currency) return false;
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'ILS'];
  return validCurrencies.includes(currency.toUpperCase());
}

function validateDate(date) {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
}

function validateAmount(amount) {
  if (amount === undefined || amount === null) return false;
  const num = Number(amount);
  return !isNaN(num) && num >= 0;
}

function validatePhone(phone) {
  if (!phone) return false;
  // Basic phone number validation - can be customized based on requirements
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
}

function validateColor(color) {
  if (!color) return false;
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const namedColors = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink',
    'brown', 'black', 'white', 'gray', 'cyan', 'magenta'
  ];
  return hexRegex.test(color) || namedColors.includes(color.toLowerCase());
}

function validateCategoryType(type) {
  if (!type) return false;
  const validTypes = ['income', 'expense', 'transfer'];
  return validTypes.includes(type.toLowerCase());
}

function validateInvestmentType(type) {
  if (!type) return false;
  const validTypes = ['stock', 'crypto', 'real_estate', 'other'];
  return validTypes.includes(type.toLowerCase());
}

function validateInsuranceType(type) {
  if (!type) return false;
  const validTypes = ['health', 'life', 'auto', 'home', 'other'];
  return validTypes.includes(type.toLowerCase());
}

function validateBusinessType(type) {
  if (!type) return false;
  const validTypes = ['sole_proprietorship', 'partnership', 'corporation', 'llc', 'other'];
  return validTypes.includes(type.toLowerCase());
}

function validatePaymentFrequency(frequency) {
  if (!frequency) return false;
  const validFrequencies = ['monthly', 'quarterly', 'annually', 'one_time'];
  return validFrequencies.includes(frequency.toLowerCase());
}

function validateRequired(value) {
  return value !== null && value !== undefined && value !== '';
}

function validateLength(value, min, max) {
  return value.length >= min && value.length <= max;
}

function validateNumber(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  validateEmail,
  validatePassword,
  validateCreditCardNumber,
  validateCurrency,
  validateDate,
  validateAmount,
  validatePhone,
  validateColor,
  validateCategoryType,
  validateInvestmentType,
  validateInsuranceType,
  validateBusinessType,
  validatePaymentFrequency,
  validateRequired,
  validateLength,
  validateNumber,
  validateURL
}; 