'use strict';

const React = window.React;
const ReactDOM = window.ReactDOM;
const { BrowserRouter, Routes, Route } = window.ReactRouterDOM;

// Import components
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Initialize app
        const initApp = async () => {
            try {
                // Add any initialization logic here
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to initialize app:', error);
                setIsLoading(false);
            }
        };

        initApp();
    }, []);

    if (isLoading) {
        return React.createElement(LoadingSpinner);
    }

    return React.createElement(ErrorBoundary, null,
        React.createElement(BrowserRouter, null,
            React.createElement(AuthProvider, null,
                React.createElement(ThemeProvider, null,
                    React.createElement('div', { className: 'app' },
                        React.createElement('div', { className: 'container' },
                            React.createElement(Sidebar),
                            React.createElement(MainContent)
                        )
                    )
                )
            )
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App)); 