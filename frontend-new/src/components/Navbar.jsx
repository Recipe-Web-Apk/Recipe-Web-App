import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Recipe Buddy
        </Link>
      </div>
      
      <div className="navbar-menu">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/recipes" className="navbar-link">Recipes</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <div className="navbar-user">
              <span className="navbar-username">Hi, {user?.username}</span>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-button">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 