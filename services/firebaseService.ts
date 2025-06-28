
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider

// This is a mock for process.env.API_KEY. 
// In a real environment, this would be set via build tools or server-side.
// For Gemini API features to work, replace "YOUR_GEMINI_API_KEY" with a valid key.

// Ensure process and process.env exist for browser environments
if (typeof window !== 'undefined') {
  // @ts-ignore
  if (typeof window.process === 'undefined') {
    // @ts-ignore
    window.process = { env: {} };
  }
  // @ts-ignore
  if (typeof window.process.env === 'undefined') {
    // @ts-ignore]
    window.process.env = {};
  }
}


// @ts-ignore
if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
  // @ts-ignore
  process.env.API_KEY = "YOUR_GEMINI_API_KEY"; 
  console.warn(
    `%c
********************************************************************************
*                                                                              *
*                           !!! IMPORTANT !!!                                  *
*                                                                              *
*      The Gemini API Key is not set or is using a placeholder value.          *
*      All AI-powered features will be disabled or will fail.                  *
*                                                                              *
*      To enable AI features, get a valid API key from Google AI Studio        *
*      and replace "YOUR_GEMINI_API_KEY" in the 'index.tsx' file.              *
*                                                                              *
*      Go to: https://aistudio.google.com/app/apikey                           *
*                                                                              *
********************************************************************************`,
    'color: #ffc107; font-weight: bold; background-color: #282c34; padding: 10px; border-radius: 5px;'
  );
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider> {/* Wrap with ThemeProvider */}
      <NotificationProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>
);