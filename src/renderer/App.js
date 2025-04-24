'use strict';

const React = window.React;
const e = React.createElement;

// Import components
const { Sidebar } = require('./components/Sidebar');
const { MainContent } = require('./components/MainContent');
const { ErrorBoundary } = require('./components/ErrorBoundary');
const { LoadingSpinner } = require('./components/LoadingSpinner');

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
        return e(LoadingSpinner);
    }

    return e(ErrorBoundary, null,
        e('div', { className: 'app' },
            e('div', { className: 'container' },
                e(Sidebar),
                e(MainContent)
            )
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App)); 