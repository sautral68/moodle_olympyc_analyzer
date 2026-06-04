import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { LangProvider } from './i18n/index.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <LangProvider>
        <App />
      </LangProvider>
    </HashRouter>
  </React.StrictMode>
)