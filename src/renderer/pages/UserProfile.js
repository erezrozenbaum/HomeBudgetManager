const React = window.React;
const { useState, useEffect } = React;
const { useNavigate } = require('react-router-dom');

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    preferences: {
      currency: 'USD',
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        showBalance: true,
        showTransactions: true,
        showGoals: true
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [category, field] = name.split('.');
    
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [field]: type === 'checkbox' ? checked : value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setSuccess('Password changed successfully');
      e.target.reset();
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/users/delete', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'p-6' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'User Profile & Preferences'),
      React.createElement(
        'div',
        { className: 'flex space-x-4' },
        React.createElement(
          'select',
          {
            className: 'border rounded px-3 py-2',
            value: activeTab,
            onChange: (e) => setActiveTab(e.target.value)
          },
          React.createElement('option', { value: 'profile' }, 'Profile'),
          React.createElement('option', { value: 'preferences' }, 'Preferences'),
          React.createElement('option', { value: 'security' }, 'Security')
        )
      )
    ),
    error && React.createElement(
      'div',
      { className: 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4' },
      error
    ),
    success && React.createElement(
      'div',
      { className: 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4' },
      success
    ),
    loading ? React.createElement(
      'div',
      { className: 'flex justify-center items-center h-64' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' })
    ) : React.createElement(
      'div',
      { className: 'bg-white rounded-lg shadow p-6' },
      activeTab === 'profile' && React.createElement(
        'div',
        { className: 'space-y-6' },
        React.createElement('h2', { className: 'text-xl font-semibold' }, 'Personal Information'),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'First Name'),
            React.createElement('input', {
              type: 'text',
              name: 'firstName',
              value: user.firstName,
              onChange: handleInputChange,
              className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Last Name'),
            React.createElement('input', {
              type: 'text',
              name: 'lastName',
              value: user.lastName,
              onChange: handleInputChange,
              className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Email'),
            React.createElement('input', {
              type: 'email',
              name: 'email',
              value: user.email,
              onChange: handleInputChange,
              className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Phone'),
            React.createElement('input', {
              type: 'tel',
              name: 'phone',
              value: user.phone,
              onChange: handleInputChange,
              className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            })
          ),
          React.createElement(
            'div',
            { className: 'md:col-span-2' },
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Address'),
            React.createElement('textarea', {
              name: 'address',
              value: user.address,
              onChange: handleInputChange,
              className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
              rows: 3
            })
          )
        ),
        React.createElement(
          'div',
          { className: 'flex justify-end space-x-4' },
          React.createElement(
            'button',
            {
              onClick: handleSave,
              disabled: saving,
              className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
            },
            saving ? 'Saving...' : 'Save Changes'
          )
        )
      ),
      activeTab === 'preferences' && React.createElement(
        'div',
        { className: 'space-y-6' },
        React.createElement('h2', { className: 'text-xl font-semibold' }, 'Preferences'),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Currency'),
            React.createElement(
              'select',
              {
                name: 'preferences.currency',
                value: user.preferences.currency,
                onChange: handlePreferenceChange,
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              },
              React.createElement('option', { value: 'USD' }, 'USD'),
              React.createElement('option', { value: 'EUR' }, 'EUR'),
              React.createElement('option', { value: 'GBP' }, 'GBP')
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Language'),
            React.createElement(
              'select',
              {
                name: 'preferences.language',
                value: user.preferences.language,
                onChange: handlePreferenceChange,
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              },
              React.createElement('option', { value: 'en' }, 'English'),
              React.createElement('option', { value: 'es' }, 'Spanish'),
              React.createElement('option', { value: 'fr' }, 'French')
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Theme'),
            React.createElement(
              'select',
              {
                name: 'preferences.theme',
                value: user.preferences.theme,
                onChange: handlePreferenceChange,
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              },
              React.createElement('option', { value: 'light' }, 'Light'),
              React.createElement('option', { value: 'dark' }, 'Dark'),
              React.createElement('option', { value: 'system' }, 'System')
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-6' },
          React.createElement('h3', { className: 'text-lg font-medium mb-4' }, 'Notifications'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'label',
              { className: 'flex items-center' },
              React.createElement('input', {
                type: 'checkbox',
                name: 'preferences.notifications.email',
                checked: user.preferences.notifications.email,
                onChange: handlePreferenceChange,
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              }),
              React.createElement('span', { className: 'ml-2' }, 'Email Notifications')
            ),
            React.createElement(
              'label',
              { className: 'flex items-center' },
              React.createElement('input', {
                type: 'checkbox',
                name: 'preferences.notifications.push',
                checked: user.preferences.notifications.push,
                onChange: handlePreferenceChange,
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              }),
              React.createElement('span', { className: 'ml-2' }, 'Push Notifications')
            ),
            React.createElement(
              'label',
              { className: 'flex items-center' },
              React.createElement('input', {
                type: 'checkbox',
                name: 'preferences.notifications.sms',
                checked: user.preferences.notifications.sms,
                onChange: handlePreferenceChange,
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              }),
              React.createElement('span', { className: 'ml-2' }, 'SMS Notifications')
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-6' },
          React.createElement('h3', { className: 'text-lg font-medium mb-4' }, 'Privacy Settings'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'label',
              { className: 'flex items-center' },
              React.createElement('input', {
                type: 'checkbox',
                name: 'preferences.privacy.showBalance',
                checked: user.preferences.privacy.showBalance,
                onChange: handlePreferenceChange,
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              }),
              React.createElement('span', { className: 'ml-2' }, 'Show Account Balance')
            ),
            React.createElement(
              'label',
              { className: 'flex items-center' },
              React.createElement('input', {
                type: 'checkbox',
                name: 'preferences.privacy.showTransactions',
                checked: user.preferences.privacy.showTransactions,
                onChange: handlePreferenceChange,
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              }),
              React.createElement('span', { className: 'ml-2' }, 'Show Transactions')
            ),
            React.createElement(
              'label',
              { className: 'flex items-center' },
              React.createElement('input', {
                type: 'checkbox',
                name: 'preferences.privacy.showGoals',
                checked: user.preferences.privacy.showGoals,
                onChange: handlePreferenceChange,
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              }),
              React.createElement('span', { className: 'ml-2' }, 'Show Financial Goals')
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'flex justify-end space-x-4' },
          React.createElement(
            'button',
            {
              onClick: handleSave,
              disabled: saving,
              className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
            },
            saving ? 'Saving...' : 'Save Changes'
          )
        )
      ),
      activeTab === 'security' && React.createElement(
        'div',
        { className: 'space-y-6' },
        React.createElement('h2', { className: 'text-xl font-semibold' }, 'Security Settings'),
        React.createElement(
          'form',
          { onSubmit: handlePasswordChange, className: 'space-y-6' },
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Current Password'),
            React.createElement('input', {
              type: 'password',
              name: 'currentPassword',
              required: true,
              className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'New Password'),
            React.createElement('input', {
              type: 'password',
              name: 'newPassword',
              required: true,
              className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Confirm New Password'),
            React.createElement('input', {
              type: 'password',
              name: 'confirmPassword',
              required: true,
              className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            })
          ),
          React.createElement(
            'div',
            { className: 'flex justify-end space-x-4' },
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: saving,
                className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
              },
              saving ? 'Changing Password...' : 'Change Password'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-8 pt-6 border-t' },
          React.createElement('h3', { className: 'text-lg font-medium text-red-600 mb-4' }, 'Danger Zone'),
          React.createElement(
            'button',
            {
              onClick: handleDeleteAccount,
              className: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
            },
            'Delete Account'
          )
        )
      )
    )
  );
};

module.exports = { UserProfile }; 