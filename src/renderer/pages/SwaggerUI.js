import React, { useState, useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

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
      const response = await fetch('/api/versions');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {versions.map((version) => (
                  <option key={version} value={version}>
                    v{version}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <SwaggerUI
              spec={spec}
              {...swaggerOptions}
              filter={searchTerm}
              onComplete={(system) => {
                // Add custom styling
                const style = document.createElement('style');
                style.textContent = `
                  .swagger-ui .opblock {
                    border-radius: 4px;
                    margin-bottom: 1rem;
                  }
                  .swagger-ui .opblock .opblock-summary {
                    border-radius: 4px 4px 0 0;
                  }
                  .swagger-ui .opblock .opblock-section {
                    border-radius: 0 0 4px 4px;
                  }
                  .swagger-ui .btn {
                    border-radius: 4px;
                  }
                  .swagger-ui .info .title {
                    color: #1a202c;
                  }
                  .swagger-ui .info .description {
                    color: #4a5568;
                  }
                `;
                document.head.appendChild(style);

                // Add custom try-it-out button
                const tryItOutButton = document.createElement('button');
                tryItOutButton.className = 'btn try-out__btn';
                tryItOutButton.textContent = 'Try it out';
                tryItOutButton.onclick = () => {
                  system.specActions.toggleTryItOut();
                };
                document.querySelector('.swagger-ui .opblock .opblock-summary-control').appendChild(tryItOutButton);
              }}
            />
          </div>
        )}
      </div>

      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
            <div className="flex space-x-4">
              <a
                href="/api/docs/download"
                className="text-blue-600 hover:text-blue-800"
                download
              >
                Download OpenAPI Spec
              </a>
              <a
                href="/api/docs/export"
                className="text-blue-600 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                Export as PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSwaggerUI; 