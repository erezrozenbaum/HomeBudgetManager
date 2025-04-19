const API_BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Bank Accounts
export const bankAccounts = {
  getAll: () => request('/bank-accounts'),
  getById: (id) => request(`/bank-accounts/${id}`),
  create: (data) => request('/bank-accounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/bank-accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/bank-accounts/${id}`, { method: 'DELETE' }),
};

// Credit Cards
export const creditCards = {
  getAll: () => request('/credit-cards'),
  getById: (id) => request(`/credit-cards/${id}`),
  create: (data) => request('/credit-cards', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/credit-cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/credit-cards/${id}`, { method: 'DELETE' }),
};

// Transactions
export const transactions = {
  getAll: () => request('/transactions'),
  getById: (id) => request(`/transactions/${id}`),
  create: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
};

// Investments
export const investments = {
  getAll: () => request('/investments'),
  getById: (id) => request(`/investments/${id}`),
  create: (data) => request('/investments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/investments/${id}`, { method: 'DELETE' }),
};

// Saving Goals
export const savingGoals = {
  getAll: () => request('/saving-goals'),
  getById: (id) => request(`/saving-goals/${id}`),
  create: (data) => request('/saving-goals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/saving-goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/saving-goals/${id}`, { method: 'DELETE' }),
};

// Loans
export const loans = {
  getAll: () => request('/loans'),
  getById: (id) => request(`/loans/${id}`),
  create: (data) => request('/loans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/loans/${id}`, { method: 'DELETE' }),
};

// Insurances
export const insurances = {
  getAll: () => request('/insurances'),
  getById: (id) => request(`/insurances/${id}`),
  create: (data) => request('/insurances', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/insurances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/insurances/${id}`, { method: 'DELETE' }),
};

// Businesses
export const businesses = {
  getAll: () => request('/businesses'),
  getById: (id) => request(`/businesses/${id}`),
  create: (data) => request('/businesses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/businesses/${id}`, { method: 'DELETE' }),
};

// AI Financial Advisor
export const aiAdvisor = {
  getInsights: (query) => request('/ai-advisor/insights', { method: 'POST', body: JSON.stringify({ query }) }),
};

// Dashboard
export const dashboard = {
  getData: (timeRange, accounts) => request('/dashboard', { method: 'POST', body: JSON.stringify({ timeRange, accounts }) }),
  exportReport: (format) => request(`/dashboard/export?format=${format}`),
};

// Settings
export const settings = {
  get: () => request('/settings'),
  update: (data) => request('/settings', { method: 'POST', body: JSON.stringify(data) }),
  importData: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/settings/import', { method: 'POST', body: formData });
  },
  exportData: () => request('/settings/export'),
}; 