const React = window.React;
const { useEffect, useRef } = React;
const { Chart } = require('chart.js/auto');
import { useTheme } from '../../context/ThemeContext';

const BarChart = ({ data, labels, title, stacked = false }) => {
  const chartRef = useRef(null);
  const { isDarkMode } = useTheme();
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

      // Destroy existing chart if it exists
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: data.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.values,
            backgroundColor: dataset.color,
            borderColor: dataset.color,
            borderWidth: 1,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title,
              color: isDarkMode ? '#fff' : '#000',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
            legend: {
              position: 'top',
              labels: {
                color: isDarkMode ? '#fff' : '#000',
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.raw || 0;
                  return `${label}: $${value.toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            x: {
              stacked: stacked,
              grid: {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: isDarkMode ? '#fff' : '#000',
              },
            },
            y: {
              stacked: stacked,
              grid: {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: isDarkMode ? '#fff' : '#000',
                callback: (value) => `$${value.toLocaleString()}`,
              },
            },
          },
        },
      });

      // Store chart instance for cleanup
      chartRef.current.chart = chart;
    }

    return () => {
      if (chartRef.current?.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [data, labels, title, stacked, isDarkMode]);

  return React.createElement(
    'div',
    { className: 'relative h-64' },
    React.createElement('canvas', { ref: chartRef })
  );
};

module.exports = { BarChart }; 