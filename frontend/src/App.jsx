import { useEffect, useState } from 'react'
import './index.css'

import MainContent from './components/MainContext'
import Navbar from './components/NavBar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  // Keeps track of which sidebar tab is selected.
  const [activeView, setActiveView] = useState('home')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Check for an existing login session when the app first opens.
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkSession()
  }, [])

  function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser)
    setActiveView('home')
  }

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
      setActiveView('home')
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-TutorBridge-mid">
      <Navbar
        activeView={activeView}
        onNavClick={setActiveView}
        user={user}
        authLoading={authLoading}
        onLogout={handleLogout}
      />
      <MainContent
        view={activeView}
        onNavClick={setActiveView}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  )
}

export default App
