const React = window.React;
const { createContext, useState, useEffect, useContext } = React;
const { ipcRenderer } = require('electron');
const { format, utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz');

const TimezoneContext = createContext();

const TimezoneProvider = ({ children }) => {
  const [timezone, setTimezone] = useState('UTC');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy');

  useEffect(() => {
    // Load saved timezone preferences
    const loadPreferences = async () => {
      try {
        const preferences = await ipcRenderer.invoke('get-timezone-preferences');
        if (preferences) {
          setTimezone(preferences.timezone || 'UTC');
          setTimeFormat(preferences.timeFormat || '24h');
          setDateFormat(preferences.dateFormat || 'MM/dd/yyyy');
        }
      } catch (error) {
        console.error('Error loading timezone preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  const setTimezonePreference = async (newTimezone) => {
    setTimezone(newTimezone);
    try {
      await ipcRenderer.invoke('set-timezone', newTimezone);
    } catch (error) {
      console.error('Error saving timezone:', error);
    }
  };

  const setTimeFormatPreference = async (format) => {
    setTimeFormat(format);
    try {
      await ipcRenderer.invoke('set-time-format', format);
    } catch (error) {
      console.error('Error saving time format:', error);
    }
  };

  const setDateFormatPreference = async (format) => {
    setDateFormat(format);
    try {
      await ipcRenderer.invoke('set-date-format', format);
    } catch (error) {
      console.error('Error saving date format:', error);
    }
  };

  const formatDateTime = (date, formatString) => {
    try {
      const zonedDate = utcToZonedTime(date, timezone);
      return format(zonedDate, formatString, { timeZone: timezone });
    } catch (error) {
      console.error('Error formatting date:', error);
      return format(date, formatString);
    }
  };

  const convertToUTC = (date) => {
    try {
      return zonedTimeToUtc(date, timezone);
    } catch (error) {
      console.error('Error converting to UTC:', error);
      return date;
    }
  };

  const value = {
    timezone,
    timeFormat,
    dateFormat,
    setTimezone: setTimezonePreference,
    setTimeFormat: setTimeFormatPreference,
    setDateFormat: setDateFormatPreference,
    formatDateTime,
    convertToUTC
  };

  return React.createElement(
    TimezoneContext.Provider,
    { value },
    children
  );
};

const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

module.exports = { TimezoneProvider, useTimezone }; 