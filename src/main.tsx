import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { PLProvider } from './context/PLContext';
import { ProgressProvider } from './context/ProgressContext';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PLProvider>
          <ProgressProvider>
            <App />
          </ProgressProvider>
        </PLProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
