import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './css/index.css' // Adjust if your CSS import path differs

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
