import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTimezone } from '../../context/TimezoneContext';
import { ipcRenderer } from 'electron';
import { FaMoon, FaSun, FaGlobe, FaClock } from 'react-icons/fa';

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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Theme Settings
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isDarkMode ? (
                <FaMoon className="text-gray-700 dark:text-gray-300 mr-2" />
              ) : (
                <FaSun className="text-gray-700 dark:text-gray-300 mr-2" />
              )}
              <span className="text-gray-700 dark:text-gray-300">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
            >
              <span
                className={`${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Time & Date Settings
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 dark:text-gray-300">
              <FaGlobe className="mr-2" />
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {loading ? (
                <option>Loading timezones...</option>
              ) : (
                Object.entries(timezones).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name} ({value.utcOffsetStr})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-700 dark:text-gray-300">
              <FaClock className="mr-2" />
              Time Format
            </label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="12h">12-hour (1:30 PM)</option>
              <option value="24h">24-hour (13:30)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-700 dark:text-gray-300">
              <FaClock className="mr-2" />
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="MM/dd/yyyy">MM/DD/YYYY</option>
              <option value="dd/MM/yyyy">DD/MM/YYYY</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings; 