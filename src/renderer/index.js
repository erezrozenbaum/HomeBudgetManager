const React = window.React;
const { createRoot } = require('react-dom/client');
const { BrowserRouter } = require('react-router-dom');
const { AuthProvider } = require('./context/AuthContext');
const { ThemeProvider } = require('./context/ThemeContext');
const { App } = require('./App');

// Error boundary for the root component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Root Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return React.createElement('div', { className: 'p-4 text-red-600' },
                'Something went wrong. Please try refreshing the page.'
            );
        }
        return this.props.children;
    }
}

const container = document.getElementById('root');
if (!container) {
    console.error('Root container not found');
    document.body.innerHTML = '<div class="p-4 text-red-600">Root container not found</div>';
} else {
    const root = createRoot(container);
    root.render(
        React.createElement(
            ErrorBoundary,
            null,
            React.createElement(
                BrowserRouter,
                null,
                React.createElement(
                    AuthProvider,
                    null,
                    React.createElement(
                        ThemeProvider,
                        null,
                        React.createElement(App)
                    )
                )
            )
        )
    );
} 