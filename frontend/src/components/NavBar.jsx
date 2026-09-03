import { HomeIcon, SearchIcon, PlusIcon, MailIcon } from './Icons'
{/*import {useAuth} from '../auth/authContext'*/}
function NavBar({ onNavClick }) {

    {/*hardcoded links for navbar*/}
  const links = [
    { key: 'home', label: 'Home' , icon: HomeIcon },
    { key: 'browse', label: 'Browse', icon: SearchIcon },
    { key: 'request', label: 'Request Help', icon: PlusIcon },
    { key: 'Messages', label: 'Messages', icon: MailIcon  },
  ]

  const user = { name: 'Jax' }
  return (

    <header className="flex flex-col w-56 shrink-0 min-h-screen  bg-TutorBridge-dark px-6 py-3 text-TutorBridge-text">
      <div className="text-xl font-bold text-TutorBridge-accent">TutorBridge</div>
      <nav className="flex flex-col gap-1">

        {/*create buttons for navbar*/}
        {links.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavClick(key)}
            className="w-full py-2 text-left hover:bg-TutorBridge-input"
            > 



              {/*display icon*/}
            <Icon size = {20} className="shrink-0" />


            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/*login */}
      
      <div className="mt-auto py-3">
        {user ? (
          <div className = "flex flex-col gap-2">
            <span className="text-TutorBridge-text">Welcome, {user.name}!</span>
          <button className = "w-full py-2 bg-TutorBridge-accent hover:bg-TutorBridge-accent-hover text-TutorBridge-text font-medium rounded-md" onClick={() => onNavClick('logout')}>
            Log out
          </button>
          </div>
        ) : ( 
          <button 
            onClick={() => onNavClick('login')}
            className="w-full py-2 bg-TutorBridge-accent hover:bg-TutorBridge-accent-hover text-TutorBridge-text font-medium rounded-md"
          >
            Sign in
          </button>
        )}
      </div>

    </header>
  )
}

export default NavBar
