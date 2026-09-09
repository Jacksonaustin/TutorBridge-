import { useEffect, useState } from 'react'
import './index.css'

import MainContent from './components/MainContext'
import Navbar from './components/NavBar'

import { API_URL } from './config/api.js'

function getSavedTheme() {
  const savedTheme = localStorage.getItem('TutorBridge-theme')
  return savedTheme === 'light' ? 'light' : 'dark'
}

function App() {
  const [activeView, setActiveView] = useState('home')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [logoutError, setLogoutError] = useState('')
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
    setLogoutError('')
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok && response.status !== 401) throw new Error('Logout failed')
      setUser(null)
      setSelectedConversationId(null)
      setActiveView('home')
    } catch {
      setLogoutError('Unable to sign out. Please try again.')
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-TutorBridge-mid">
      {logoutError && (
        <p role="alert" className="fixed right-4 top-4 z-50 rounded bg-TutorBridge-input p-3 text-TutorBridge-danger">
          {logoutError}
        </p>
      )}
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
