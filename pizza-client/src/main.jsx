import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 📍 IMPORT THE ROUTER
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* 📍 WRAP THE APP HERE */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
