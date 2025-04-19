import React, { createContext, useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const TimezoneContext = createContext();

export const TimezoneProvider = ({ children }) => {
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

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}; 