/*
 * Saodat Restoran — onlayn buyurtma tizimi (frontend)
 * Muallif: Ibrayimov Javohir
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
