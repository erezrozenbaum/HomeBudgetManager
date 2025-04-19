// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex
// At least 8 characters, one number, and one special character
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - Whether the email is valid
 */
const validateEmail = (email) => {
  return emailRegex.test(email);
};

/**
 * Validates a password format
 * @param {string} password - The password to validate
 * @returns {boolean} - Whether the password is valid
 */
const validatePassword = (password) => {
  return passwordRegex.test(password);
};

module.exports = {
  validateEmail,
  validatePassword
}; 