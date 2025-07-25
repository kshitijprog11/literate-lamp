import { Link, useLocation } from 'react-router-dom'

function Navbar({ onNavigate }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const handleNavClick = (sectionId) => {
    if (isHomePage && onNavigate) {
      onNavigate(sectionId)
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/">
            <h1>Mindful Dining</h1>
          </Link>
        </div>
        <ul className="nav-menu">
          {isHomePage ? (
            <>
              <li><a href="#about" onClick={() => handleNavClick('about')}>About</a></li>
              <li><a href="#how-it-works" onClick={() => handleNavClick('how-it-works')}>How It Works</a></li>
              <li><a href="#contact" onClick={() => handleNavClick('contact')}>Contact</a></li>
            </>
          ) : (
            <>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/reservation">Reserve</Link></li>
              <li><Link to="/admin-dashboard">Admin</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar