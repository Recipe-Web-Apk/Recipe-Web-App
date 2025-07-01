import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Simple avatar: use first letter of username
  const avatar = user?.username ? user.username[0].toUpperCase() : '?'

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Recipe Buddy
        </Link>
      </div>
      
      <div className="navbar-menu">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/recipes/create" className="navbar-button navbar-create">+ Create Recipe</Link>
        <Link to="/recipes" className="navbar-link">Explore</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <div className="navbar-user">
              <Link to="/profile" className="navbar-avatar" title="Profile">
                {avatar}
              </Link>
              <span className="navbar-username">{user?.username}</span>
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