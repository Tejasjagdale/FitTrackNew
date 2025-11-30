import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ThemeModeProvider from './ThemeModeProvider'
import './styles.css'
import App from './App'
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  StatusBar.setOverlaysWebView({ overlay: false });
  StatusBar.setStyle({ style: Style.Dark });
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeModeProvider>
  </React.StrictMode>
)
