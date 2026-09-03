import { HomeIcon, SearchIcon, PlusIcon, MailIcon } from './Icons'

function NavBar({ onNavClick }) {

    //hardcoded links for navbar 
  const links = [
    { key: 'home', label: 'Home' , icon: HomeIcon },
    { key: 'browse', label: 'Browse', icon: SearchIcon },
    { key: 'request', label: 'Request Help', icon: PlusIcon },
    { key: 'Messages', label: 'Messages', icon: MailIcon  },
  ]

  return (

    <header className="flex flex-col w-56 shrink-0 min-h-screen  bg-TutorBridge-dark px-6 py-3 text-TutorBridge-text">
      <div className="text-xl font-bold text-TutorBridge-accent">TutorBridge</div>
      <nav className="flex flex-col gap-1">
        {links.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavClick(key)}
            className="w-full py-2 text-left hover:bg-TutorBridge-input"
          >
            <Icon size = {20} className="shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}

export default NavBar
