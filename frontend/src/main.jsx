import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import { AppContentProvider } from './context/AppContext.jsx'

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AppContentProvider>
        <App />
      </AppContentProvider>
    </BrowserRouter>
)
