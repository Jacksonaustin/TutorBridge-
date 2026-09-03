import { LoginCard } from './Login'

function MainContent({ view }) {
  return (
    <main
      className="min-w-0 flex-1 bg-TutorBridge-mid p-6 text-TutorBridge-text"
      data-view={view}
      aria-label={`${view} content`}
    >
      {view === 'login' && <LoginCard />}
      {view !== 'login' && (
        <p className="text-TutorBridge-muted">Current view: {view}</p>
      )}
    </main>
  )
}

export default MainContent
