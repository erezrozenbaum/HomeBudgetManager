const React = window.React;
const { Button } = require('../Button');
const { Card } = require('../Card');

class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Auth Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return React.createElement(
        Card,
        {
          className: 'max-w-md mx-auto mt-8'
        },
        React.createElement(
          'div',
          { className: 'text-center space-y-4' },
          React.createElement(
            'h2',
            { className: 'text-xl font-semibold text-red-600' },
            'Authentication Error'
          ),
          React.createElement(
            'p',
            { className: 'text-gray-600' },
            'An error occurred during authentication. Please try again.'
          ),
          React.createElement(
            Button,
            {
              onClick: this.handleRetry,
              className: 'mt-4'
            },
            'Try Again'
          )
        )
      );
    }

    return this.props.children;
  }
}

module.exports = { AuthErrorBoundary }; 