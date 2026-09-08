import {
  HomeIcon,
  SearchIcon,
  PlusIcon,
  MailIcon,
  SunIcon,
  MoonIcon,
} from './Icons'

function NavBar({
  activeView,
  onNavClick,
  user,
  authLoading,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const links = [
    { key: 'home', label: 'Home', icon: HomeIcon },
    { key: 'browse', label: 'Browse', icon: SearchIcon },
    { key: 'request', label: 'Request Help', icon: PlusIcon },
    { key: 'messages', label: 'Messages', icon: MailIcon },
  ]

  const isDark = theme === 'dark'

  return (
    <aside className="flex h-dvh w-60 shrink-0 flex-col border-r border-TutorBridge-darkest bg-TutorBridge-dark px-3 py-4 text-TutorBridge-text">
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
        {user ? (
          <div className="rounded-md bg-TutorBridge-darkest p-3">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-TutorBridge-text">{user.name}</div>
                <div className="truncate text-xs text-TutorBridge-muted">
                  {user.major || user.email}
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleTheme}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-TutorBridge-input text-TutorBridge-muted transition-colors hover:text-TutorBridge-text"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="mt-3 w-full rounded-md bg-TutorBridge-input px-3 py-2 text-sm font-medium text-TutorBridge-text transition-colors hover:bg-TutorBridge-danger hover:text-white"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex w-full items-center justify-between rounded-md bg-TutorBridge-darkest px-3 py-2.5 text-sm font-medium text-TutorBridge-muted transition-colors hover:bg-TutorBridge-input hover:text-TutorBridge-text"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              type="button"
              onClick={() => onNavClick('login')}
              disabled={authLoading}
              className="w-full rounded-md bg-TutorBridge-accent px-3 py-2.5 font-medium text-TutorBridge-on-accent transition-colors hover:bg-TutorBridge-accent-hover disabled:cursor-wait disabled:opacity-60"
            >
              {authLoading ? 'Checking session...' : 'Sign in'}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default NavBar
