import Home from './Home'
import { LoginCard } from './Login'
import RequestHelp from './RequestHelp'
import Browse from './Browse'
import Messages from './Messages'

function MainContent({
  view,
  onNavClick,
  onAuthenticated,
  user,
  selectedConversationId,
  onOpenConversation,
}) {
  return (
    <main
      className="h-dvh min-w-0 flex-1 overflow-y-auto bg-TutorBridge-mid text-TutorBridge-text"
      data-view={view}
      aria-label={`${view} content`}
    >
      {view === 'home' && <Home onNavClick={onNavClick} />}

      {view === 'login' && (
        <LoginCard onAuthenticated={onAuthenticated} />
      )}

      {view === 'request' && <RequestHelp />}

      {view === 'browse' && (
        <Browse
          user={user}
          onOpenConversation={onOpenConversation}
        />
      )}

      {view === 'messages' && (
        <Messages
          user={user}
          initialConversationId={selectedConversationId}
        />
      )}
    </main>
  )
}

export default MainContent