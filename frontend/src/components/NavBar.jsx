function NavBar({ onNavClick }) {

    //hardcoded links for navbar 
  const links = [
    ['home', 'Home'],
    ['browse', 'Browse'],
    ['request', 'Request Help'],
    ['about', 'About'],
  ]

  return (

    <header className="flex flex-col w-56 shrink-0 min-h-screen  bg-TutorBridge-dark px-6 py-3 text-TutorBridge-text">
      <div className="text-xl font-bold text-TutorBridge-accent">TutorBridge</div>
      <nav className="flex-col-1">
        {links.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onNavClick(key)}
            className="w-full py-2 text-left hover:bg-TutorBridge-input"
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export default NavBar
