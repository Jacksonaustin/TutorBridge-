import Home from './Home'
import { LoginCard } from './Login'
import RequestHelp from './RequestHelp'
import Browse from './Browse'

function MainContent({ view, onNavClick, onAuthenticated, user }) {
  return (
    <main
      className="h-dvh min-w-0 flex-1 overflow-y-auto bg-TutorBridge-mid text-TutorBridge-text"
      data-view={view}
      aria-label={`${view} content`}
    >
      {view === 'home' && <Home onNavClick={onNavClick} />}
      {view === 'login' && <LoginCard onAuthenticated={onAuthenticated} />}
      {view === 'request' && <RequestHelp />}
      {view === 'browse' && <Browse user={user} />}
    </main>
  )
}

export default MainContent