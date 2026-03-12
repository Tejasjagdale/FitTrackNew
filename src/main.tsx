import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./styles.css"
import App from "./App"

import { StatusBar, Style } from "@capacitor/status-bar"
import { Capacitor } from "@capacitor/core"

import { AppThemeProvider } from "./theme/ThemeContext"

/* Android StatusBar setup */
if (Capacitor.getPlatform() === "android") {
  StatusBar.setOverlaysWebView({ overlay: false })
  StatusBar.setStyle({ style: Style.Dark })
}

/* Root Render */
createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppThemeProvider>
  </React.StrictMode>
)