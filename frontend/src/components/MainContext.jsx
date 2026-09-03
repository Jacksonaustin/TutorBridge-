import Home from './Home'
import { LoginCard } from './Login'

function MainContent({ view, onNavClick }) {
  return (
    <main
      className="h-dvh min-w-0 flex-1 overflow-y-auto bg-TutorBridge-mid text-TutorBridge-text"
      data-view={view}
      aria-label={`${view} content`}
    >
      {view === 'home' && <Home onNavClick={onNavClick} />}
      {view === 'login' && <LoginCard />}
    </main>
  )
}

export default MainContent
