const React = window.React;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        'div',
        { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
        React.createElement(
          'div',
          { className: 'max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg' },
          React.createElement(
            'div',
            null,
            React.createElement(
              'h2',
              { className: 'mt-6 text-center text-3xl font-extrabold text-gray-900' },
              'Something went wrong'
            ),
            React.createElement(
              'p',
              { className: 'mt-2 text-center text-sm text-gray-600' },
              'We\'re sorry, but something went wrong. Please try refreshing the page.'
            )
          ),
          React.createElement(
            'div',
            { className: 'mt-8 space-y-6' },
            React.createElement(
              'button',
              {
                onClick: () => window.location.reload(),
                className: 'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              },
              'Refresh Page'
            ),
            process.env.NODE_ENV === 'development' && React.createElement(
              'div',
              { className: 'mt-4 p-4 bg-gray-100 rounded-md' },
              React.createElement(
                'h3',
                { className: 'text-sm font-medium text-gray-900' },
                'Error Details:'
              ),
              React.createElement(
                'pre',
                { className: 'mt-2 text-xs text-gray-500 overflow-auto' },
                this.state.error && this.state.error.toString(),
                this.state.errorInfo && this.state.errorInfo.componentStack
              )
            )
          )
        )
      );
    }

    return this.props.children;
  }
}

module.exports = { ErrorBoundary }; 