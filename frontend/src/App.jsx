import { useEffect, useState } from 'react'
import './index.css'

import MainContent from './components/MainContext'
import Navbar from './components/NavBar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getSavedTheme() {
  const savedTheme = localStorage.getItem('TutorBridge-theme')
  return savedTheme === 'light' ? 'light' : 'dark'
}

function App() {
  const [activeView, setActiveView] = useState('home')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [theme, setTheme] = useState(getSavedTheme)

  const [selectedConversationId, setSelectedConversationId] =
    useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('TutorBridge-theme', theme)
  }, [theme])

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

  function handleToggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark'
    )
  }

  function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser)
    setActiveView('home')
  }

  function handleOpenConversation(conversationId) {
    setSelectedConversationId(conversationId)
    setActiveView('messages')
  }

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
      setSelectedConversationId(null)
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
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <MainContent
        view={activeView}
        onNavClick={setActiveView}
        onAuthenticated={handleAuthenticated}
        user={user}
        selectedConversationId={selectedConversationId}
        onOpenConversation={handleOpenConversation}
      />
    </div>
  )
}

export default App
