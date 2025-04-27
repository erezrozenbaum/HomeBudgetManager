const React = window.React;
const { useState, useEffect } = React;

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      theme: 'light'
    },
    categories: {
      income: ['Salary', 'Freelance', 'Investments'],
      expenses: ['Housing', 'Food', 'Transport', 'Entertainment', 'Utilities']
    },
    security: {
      password: '',
      encryption: false,
      backup: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current settings from the API
    fetch('/api/settings')
      .then(response => response.json())
      .then(data => setSettings(data))
      .catch(error => console.error('Error fetching settings:', error));
  }, []);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleCategoryAdd = (type, category) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: [...prev.categories[type], category]
      }
    }));
  };

  const handleCategoryRemove = (type, index) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: prev.categories[type].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Error saving settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
      console.error('Error saving settings:', error);
    }
    setLoading(false);
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setMessage('Data imported successfully!');
      } else {
        setMessage('Error importing data');
      }
    } catch (error) {
      setMessage('Error importing data');
      console.error('Error importing data:', error);
    }
    setLoading(false);
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'settings-backup.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage('Data exported successfully!');
      } else {
        setMessage('Error exporting data');
      }
    } catch (error) {
      setMessage('Error exporting data');
      console.error('Error exporting data:', error);
    }
    setLoading(false);
  };

  return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
    React.createElement('h1', { className: 'text-2xl font-bold mb-6' }, 'Settings'),
    React.createElement('div', { className: 'flex space-x-4 mb-6' },
      React.createElement('button', {
        onClick: () => setActiveTab('general'),
        className: `px-4 py-2 rounded ${activeTab === 'general' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
      }, 'General'),
      React.createElement('button', {
        onClick: () => setActiveTab('categories'),
        className: `px-4 py-2 rounded ${activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
      }, 'Categories'),
      React.createElement('button', {
        onClick: () => setActiveTab('security'),
        className: `px-4 py-2 rounded ${activeTab === 'security' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
      }, 'Security')
    ),
    React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
      activeTab === 'general' && React.createElement('div', null,
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Language'),
          React.createElement('select', {
            value: settings.general.language,
            onChange: (e) => handleSettingChange('general', 'language', e.target.value),
            className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          },
            React.createElement('option', { value: 'en' }, 'English'),
            React.createElement('option', { value: 'es' }, 'Spanish'),
            React.createElement('option', { value: 'fr' }, 'French')
          )
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Timezone'),
          React.createElement('select', {
            value: settings.general.timezone,
            onChange: (e) => handleSettingChange('general', 'timezone', e.target.value),
            className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          },
            React.createElement('option', { value: 'UTC' }, 'UTC'),
            React.createElement('option', { value: 'EST' }, 'Eastern Time'),
            React.createElement('option', { value: 'PST' }, 'Pacific Time')
          )
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Currency'),
          React.createElement('select', {
            value: settings.general.currency,
            onChange: (e) => handleSettingChange('general', 'currency', e.target.value),
            className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          },
            React.createElement('option', { value: 'USD' }, 'USD'),
            React.createElement('option', { value: 'EUR' }, 'EUR'),
            React.createElement('option', { value: 'GBP' }, 'GBP')
          )
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Theme'),
          React.createElement('select', {
            value: settings.general.theme,
            onChange: (e) => handleSettingChange('general', 'theme', e.target.value),
            className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          },
            React.createElement('option', { value: 'light' }, 'Light'),
            React.createElement('option', { value: 'dark' }, 'Dark')
          )
        )
      ),
      activeTab === 'categories' && React.createElement('div', null,
        React.createElement('div', { className: 'mb-4' },
          React.createElement('h2', { className: 'text-lg font-medium mb-2' }, 'Income Categories'),
          React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
            settings.categories.income.map((category, index) =>
              React.createElement('div', {
                key: index,
                className: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center'
              },
                React.createElement('span', null, category),
                React.createElement('button', {
                  onClick: () => handleCategoryRemove('income', index),
                  className: 'ml-2 text-blue-600 hover:text-blue-800'
                }, '×')
              )
            )
          ),
          React.createElement('div', { className: 'flex' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'New income category',
              className: 'flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
              onKeyDown: (e) => {
                if (e.key === 'Enter' && e.target.value) {
                  handleCategoryAdd('income', e.target.value);
                  e.target.value = '';
                }
              }
            }),
            React.createElement('button', {
              onClick: () => {
                const input = document.querySelector('input[placeholder="New income category"]');
                if (input.value) {
                  handleCategoryAdd('income', input.value);
                  input.value = '';
                }
              },
              className: 'px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600'
            }, 'Add')
          )
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('h2', { className: 'text-lg font-medium mb-2' }, 'Expense Categories'),
          React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
            settings.categories.expenses.map((category, index) =>
              React.createElement('div', {
                key: index,
                className: 'bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center'
              },
                React.createElement('span', null, category),
                React.createElement('button', {
                  onClick: () => handleCategoryRemove('expenses', index),
                  className: 'ml-2 text-red-600 hover:text-red-800'
                }, '×')
              )
            )
          ),
          React.createElement('div', { className: 'flex' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'New expense category',
              className: 'flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
              onKeyDown: (e) => {
                if (e.key === 'Enter' && e.target.value) {
                  handleCategoryAdd('expenses', e.target.value);
                  e.target.value = '';
                }
              }
            }),
            React.createElement('button', {
              onClick: () => {
                const input = document.querySelector('input[placeholder="New expense category"]');
                if (input.value) {
                  handleCategoryAdd('expenses', input.value);
                  input.value = '';
                }
              },
              className: 'px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600'
            }, 'Add')
          )
        )
      ),
      activeTab === 'security' && React.createElement('div', null,
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Password'),
          React.createElement('input', {
            type: 'password',
            value: settings.security.password,
            onChange: (e) => handleSettingChange('security', 'password', e.target.value),
            className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          })
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'flex items-center' },
            React.createElement('input', {
              type: 'checkbox',
              checked: settings.security.encryption,
              onChange: (e) => handleSettingChange('security', 'encryption', e.target.checked),
              className: 'rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            React.createElement('span', { className: 'ml-2 text-sm text-gray-700' }, 'Enable Encryption')
          )
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'flex items-center' },
            React.createElement('input', {
              type: 'checkbox',
              checked: settings.security.backup,
              onChange: (e) => handleSettingChange('security', 'backup', e.target.checked),
              className: 'rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            React.createElement('span', { className: 'ml-2 text-sm text-gray-700' }, 'Enable Automatic Backup')
          )
        )
      )
    ),
    React.createElement('div', { className: 'mt-6 flex justify-between' },
      React.createElement('div', { className: 'flex space-x-4' },
        React.createElement('button', {
          onClick: handleImportData,
          className: 'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
        }, 'Import Settings'),
        React.createElement('button', {
          onClick: handleExportData,
          className: 'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
        }, 'Export Settings')
      ),
      React.createElement('button', {
        onClick: handleSaveSettings,
        disabled: loading,
        className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
      }, loading ? 'Saving...' : 'Save Settings')
    ),
    message && React.createElement('div', {
      className: `mt-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
    }, message)
  );
};

module.exports = { Settings }; 