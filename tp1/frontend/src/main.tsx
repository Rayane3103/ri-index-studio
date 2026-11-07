import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './App'
import { AuthProvider } from './auth/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user" turns off movement when the OS asks for less motion */}
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <App />
      </AuthProvider>
    </MotionConfig>
  </StrictMode>,
)
