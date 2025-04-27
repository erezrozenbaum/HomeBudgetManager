const React = window.React;
const { useState } = React;
const { Tab } = require('@headlessui/react');
const { Documentation } = require('./Documentation');

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    {
      name: 'General',
      content: React.createElement(
        'div',
        { className: 'space-y-6' },
        React.createElement(
          'div',
          { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Language & Region'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Language'),
              React.createElement(
                'select',
                { className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' },
                React.createElement('option', null, 'English'),
                React.createElement('option', null, 'Hebrew'),
                React.createElement('option', null, 'Spanish')
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Timezone'),
              React.createElement(
                'select',
                { className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' },
                React.createElement('option', null, 'UTC'),
                React.createElement('option', null, 'EST'),
                React.createElement('option', null, 'PST')
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Default Currency'),
              React.createElement(
                'select',
                { className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' },
                React.createElement('option', null, 'USD'),
                React.createElement('option', null, 'ILS'),
                React.createElement('option', null, 'EUR')
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Appearance'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Theme'),
              React.createElement(
                'select',
                { className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' },
                React.createElement('option', null, 'Light'),
                React.createElement('option', null, 'Dark'),
                React.createElement('option', null, 'System')
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Font Size'),
              React.createElement(
                'select',
                { className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' },
                React.createElement('option', null, 'Small'),
                React.createElement('option', null, 'Medium'),
                React.createElement('option', null, 'Large')
              )
            )
          )
        )
      )
    },
    {
      name: 'Security',
      content: React.createElement(
        'div',
        { className: 'space-y-6' },
        React.createElement(
          'div',
          { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Password Protection'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Current Password'),
              React.createElement('input', { type: 'password', className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'New Password'),
              React.createElement('input', { type: 'password', className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Confirm New Password'),
              React.createElement('input', { type: 'password', className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' })
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Data Encryption'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'div',
              { className: 'flex items-center' },
              React.createElement('input', { type: 'checkbox', className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded' }),
              React.createElement('label', { className: 'ml-2 block text-sm text-gray-900' }, 'Enable Data Encryption')
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Encryption Key'),
              React.createElement('input', { type: 'password', className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' })
            )
          )
        )
      )
    },
    {
      name: 'Backup',
      content: React.createElement(
        'div',
        { className: 'space-y-6' },
        React.createElement(
          'div',
          { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Automatic Backup'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'div',
              { className: 'flex items-center' },
              React.createElement('input', { type: 'checkbox', className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded' }),
              React.createElement('label', { className: 'ml-2 block text-sm text-gray-900' }, 'Enable Automatic Backup')
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Backup Frequency'),
              React.createElement(
                'select',
                { className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' },
                React.createElement('option', null, 'Daily'),
                React.createElement('option', null, 'Weekly'),
                React.createElement('option', null, 'Monthly')
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Backup Location'),
              React.createElement('input', { type: 'text', className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500' })
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Manual Backup'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'button',
              { className: 'bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600' },
              'Create Backup Now'
            ),
            React.createElement(
              'button',
              { className: 'bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 ml-4' },
              'Restore from Backup'
            )
          )
        )
      )
    },
    {
      name: 'Documentation',
      content: React.createElement(Documentation)
    }
  ];

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto p-6' },
    React.createElement('h1', { className: 'text-3xl font-bold mb-8' }, 'Settings'),
    React.createElement(
      Tab.Group,
      { selectedIndex: selectedTab, onChange: setSelectedTab },
      React.createElement(
        Tab.List,
        { className: 'flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6' },
        tabs.map((tab, index) =>
          React.createElement(
            Tab,
            {
              key: index,
              className: ({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  selected
                    ? 'bg-white shadow text-blue-700'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
            },
            tab.name
          )
        )
      ),
      React.createElement(
        Tab.Panels,
        { className: 'mt-2' },
        tabs.map((tab, index) =>
          React.createElement(
            Tab.Panel,
            {
              key: index,
              className: 'rounded-xl bg-white p-6 shadow-lg'
            },
            tab.content
          )
        )
      )
    )
  );
};

module.exports = { Settings }; 