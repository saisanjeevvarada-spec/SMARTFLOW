import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from './App'
import './styles/global.css'
import { AuthProvider } from './auth/AuthProvider'

const rawClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
const isGoogleConfigured = Boolean(rawClientId && !rawClientId.includes("YOUR_GOOGLE_CLIENT_ID"));

const mainContent = (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          className: 'glassy-toast',
        }}
      />
      <App />
    </BrowserRouter>
  </AuthProvider>
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isGoogleConfigured ? (
      <GoogleOAuthProvider clientId={rawClientId}>
        {mainContent}
      </GoogleOAuthProvider>
    ) : (
      mainContent
    )}
  </React.StrictMode>
);
