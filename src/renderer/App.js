'use strict';

const e = React.createElement;

function App() {
    return e('div', { className: 'app' },
        e('h1', null, 'Home Budget Manager'),
        e('div', { className: 'content' },
            'Welcome to Home Budget Manager'
        )
    );
}

// Make App available globally
window.App = App;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App)); 