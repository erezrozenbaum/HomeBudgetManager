const React = window.React;
const { useState, useEffect } = React;
const SwaggerUI = require('swagger-ui-react');
require('swagger-ui-react/swagger-ui.css');

const CustomSwaggerUI = () => {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('latest');
  const [versions, setVersions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVersions();
    fetchSpec();
  }, [selectedVersion]);

  const fetchVersions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/versions');
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const fetchSpec = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/docs/${selectedVersion}`);
      const data = await response.json();
      setSpec(data);
    } catch (error) {
      setError('Failed to load API documentation');
      console.error('Error fetching spec:', error);
    }
    setLoading(false);
  };

  const swaggerOptions = {
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    deepLinking: true,
    displayOperationId: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    defaultModelRendering: 'model',
    displayRequestDuration: true,
    tryItOutEnabled: true,
    requestSnippetsEnabled: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai'
    },
    persistAuthorization: true,
    layout: 'BaseLayout',
    plugins: [
      {
        statePlugins: {
          spec: {
            wrapSelectors: {
              allowTryItOutFor: () => () => true
            }
          }
        }
      }
    ]
  };

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-100' },
    React.createElement(
      'div',
      { className: 'bg-white shadow' },
      React.createElement(
        'div',
        { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-center py-4' },
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'API Documentation'),
          React.createElement(
            'div',
            { className: 'flex items-center space-x-4' },
            React.createElement(
              'div',
              { className: 'relative' },
              React.createElement('input', {
                type: 'text',
                placeholder: 'Search endpoints...',
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: 'border rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }),
              React.createElement(
                'svg',
                {
                  className: 'absolute left-3 top-2.5 h-5 w-5 text-gray-400',
                  fill: 'none',
                  stroke: 'currentColor',
                  viewBox: '0 0 24 24'
                },
                React.createElement('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                })
              )
            ),
            React.createElement(
              'select',
              {
                value: selectedVersion,
                onChange: (e) => setSelectedVersion(e.target.value),
                className: 'border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              },
              versions.map(version => 
                React.createElement('option', { key: version, value: version }, version)
              )
            )
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' },
      loading ? React.createElement(
        'div',
        { className: 'flex justify-center items-center h-64' },
        React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' })
      ) : error ? React.createElement(
        'div',
        { className: 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' },
        error
      ) : React.createElement(SwaggerUI, {
        spec: spec,
        ...swaggerOptions
      })
    )
  );
};

module.exports = { CustomSwaggerUI }; 