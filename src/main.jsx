import React from 'react';
import ReactDOM from 'react-dom/client';
import Nexo from './Nexo.jsx';
import './index.css';

// localStorage polyfill matching the original window.storage API used by the component
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    get: async (key) => {
      const value = localStorage.getItem(key);
      return value !== null ? { value } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
    },
    delete: async (key) => {
      localStorage.removeItem(key);
    },
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Nexo />
  </React.StrictMode>,
);
