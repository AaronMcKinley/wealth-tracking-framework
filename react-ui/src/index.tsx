import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Global styles
import App from './App';  // Main React component

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
