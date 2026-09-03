import { HomeIcon, SearchIcon, PlusIcon, MailIcon } from './Icons'

function NavBar({ activeView, onNavClick }) {
  const links = [
    { key: 'home', label: 'Home', icon: HomeIcon },
    { key: 'browse', label: 'Browse', icon: SearchIcon },
    { key: 'request', label: 'Request Help', icon: PlusIcon },
    { key: 'messages', label: 'Messages', icon: MailIcon },
  ]

  return (
    <aside className="flex min-h-screen w-60 shrink-0 flex-col border-r border-TutorBridge-darkest bg-TutorBridge-dark px-3 py-4 text-TutorBridge-text">
      <div className="mb-5 px-3">
        <div className="text-xl font-bold text-TutorBridge-text">TutorBridge</div>
        <div className="text-sm text-TutorBridge-muted">Students helping students</div>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ key, label, icon: Icon }) => {
          const selected = activeView === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavClick(key)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-medium transition-colors ${
                selected
                  ? 'bg-TutorBridge-input text-TutorBridge-text'
                  : 'text-TutorBridge-muted hover:bg-TutorBridge-input hover:text-TutorBridge-text'
              }`}
              aria-current={selected ? 'page' : undefined}
            >
              <Icon />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-TutorBridge-input pt-3">
        <button
          type="button"
          onClick={() => onNavClick('login')}
          className="w-full rounded-md bg-TutorBridge-accent px-3 py-2.5 font-medium text-TutorBridge-text transition-colors hover:bg-TutorBridge-accent-hover"
        >
          Sign in
        </button>
      </div>
    </aside>
  )
}

export default NavBar
