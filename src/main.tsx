import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./styles.css"
import App from "./App"

import { StatusBar, Style } from "@capacitor/status-bar"
import { Capacitor } from "@capacitor/core"

import { AppThemeProvider } from "./theme/ThemeContext"
import { loadProgressData } from "./data/progressDataService"

/* Android StatusBar setup */
if (Capacitor.getPlatform() === "android") {
  StatusBar.setOverlaysWebView({ overlay: false })
  StatusBar.setStyle({ style: Style.Dark })
}

async function start() {

  let theme : "apple" | "jarvis" | "pokemon" | "cherry" | undefined = "apple"

  try {
    const data = await loadProgressData()
    theme = data?.profile?.theme || "apple"
  } catch {
    console.warn("Failed to load theme, using default")
  }

  createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <AppThemeProvider initialTheme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppThemeProvider>
    </React.StrictMode>
  )
}

start()