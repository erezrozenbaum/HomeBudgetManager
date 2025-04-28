import React, { useEffect, useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    window.electron.receive('fromMain', (message: string) => {
      setMessage(message);
    });

    // Example of sending a message to main process
    window.electron.send('toMain', 'Hello from renderer');

    // No cleanup needed as the receive handler is managed by the main process
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Home Budget Manager</h1>
      </header>
      <main className="app-main">
        <p>Welcome to your personal budget management application!</p>
        {message && <p>{message}</p>}
      </main>
    </div>
  );
};

export default App; 