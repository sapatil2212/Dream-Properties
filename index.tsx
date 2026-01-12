import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Global error boundary for development preview
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Application Error:', message, 'at', source, lineno, colno);
};

const RootApp = () => {
  useEffect(() => {
    // Dismiss splash screen once the app component is mounted and hydrated
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('fade-out');
    }
    console.log('Dream Properties App Mounted Successfully');
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<RootApp />);
} else {
  console.error('Critical Error: Root container element not found in the DOM.');
}