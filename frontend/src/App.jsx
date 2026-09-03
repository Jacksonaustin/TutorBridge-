import { useState } from 'react'
import './index.css'

import MainContent from './components/MainContext'
import Navbar from './components/NavBar'

function App() {
  // Keeps track of which sidebar tab is selected.
  const [activeView, setActiveView] = useState('home')

  return (
    <div className="flex min-h-screen bg-TutorBridge-mid">
      <Navbar activeView={activeView} onNavClick={setActiveView} />
      <MainContent view={activeView} />
    </div>
  )
}

export default App
