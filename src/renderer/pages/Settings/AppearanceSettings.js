const React = window.React;
const { useState, useEffect } = React;
const { useTheme } = require('../../context/ThemeContext');
const { useTimezone } = require('../../context/TimezoneContext');
const { ipcRenderer } = require('electron');
const { FaMoon, FaSun, FaGlobe, FaClock } = require('react-icons/fa');

const AppearanceSettings = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { 
    timezone, 
    timeFormat, 
    dateFormat, 
    setTimezone, 
    setTimeFormat, 
    setDateFormat 
  } = useTimezone();

  const [timezones, setTimezones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimezones = async () => {
      try {
        const availableTimezones = await ipcRenderer.invoke('get-available-timezones');
        setTimezones(availableTimezones);
      } catch (error) {
        console.error('Error loading timezones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimezones();
  }, []);

  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'bg-white dark:bg-gray-800 rounded-lg shadow p-6' },
      React.createElement(
        'h2',
        { className: 'text-xl font-semibold text-gray-900 dark:text-white mb-4' },
        'Theme Settings'
      ),
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'div',
          { className: 'flex items-center justify-between' },
          React.createElement(
            'div',
            { className: 'flex items-center' },
            isDarkMode
              ? React.createElement(FaMoon, { className: 'text-gray-700 dark:text-gray-300 mr-2' })
              : React.createElement(FaSun, { className: 'text-gray-700 dark:text-gray-300 mr-2' }),
            React.createElement(
              'span',
              { className: 'text-gray-700 dark:text-gray-300' },
              isDarkMode ? 'Dark Mode' : 'Light Mode'
            )
          ),
          React.createElement(
            'button',
            {
              onClick: toggleTheme,
              className: 'relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700'
            },
            React.createElement(
              'span',
              {
                className: `${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`
              }
            )
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'bg-white dark:bg-gray-800 rounded-lg shadow p-6' },
      React.createElement(
        'h2',
        { className: 'text-xl font-semibold text-gray-900 dark:text-white mb-4' },
        'Time & Date Settings'
      ),
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'div',
          { className: 'space-y-2' },
          React.createElement(
            'label',
            { className: 'flex items-center text-gray-700 dark:text-gray-300' },
            React.createElement(FaGlobe, { className: 'mr-2' }),
            'Timezone'
          ),
          React.createElement(
            'select',
            {
              value: timezone,
              onChange: (e) => setTimezone(e.target.value),
              className: 'w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            },
            loading
              ? React.createElement('option', null, 'Loading timezones...')
              : Object.entries(timezones).map(([key, value]) =>
                  React.createElement(
                    'option',
                    { key: key, value: key },
                    `${value.name} (${value.utcOffsetStr})`
                  )
                )
          )
        ),
        React.createElement(
          'div',
          { className: 'space-y-2' },
          React.createElement(
            'label',
            { className: 'flex items-center text-gray-700 dark:text-gray-300' },
            React.createElement(FaClock, { className: 'mr-2' }),
            'Time Format'
          ),
          React.createElement(
            'select',
            {
              value: timeFormat,
              onChange: (e) => setTimeFormat(e.target.value),
              className: 'w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            },
            React.createElement('option', { value: '12h' }, '12-hour (1:30 PM)'),
            React.createElement('option', { value: '24h' }, '24-hour (13:30)')
          )
        ),
        React.createElement(
          'div',
          { className: 'space-y-2' },
          React.createElement(
            'label',
            { className: 'flex items-center text-gray-700 dark:text-gray-300' },
            React.createElement(FaClock, { className: 'mr-2' }),
            'Date Format'
          ),
          React.createElement(
            'select',
            {
              value: dateFormat,
              onChange: (e) => setDateFormat(e.target.value),
              className: 'w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            },
            React.createElement('option', { value: 'MM/dd/yyyy' }, 'MM/DD/YYYY'),
            React.createElement('option', { value: 'dd/MM/yyyy' }, 'DD/MM/YYYY'),
            React.createElement('option', { value: 'yyyy-MM-dd' }, 'YYYY-MM-DD')
          )
        )
      )
    )
  );
};

module.exports = AppearanceSettings; 