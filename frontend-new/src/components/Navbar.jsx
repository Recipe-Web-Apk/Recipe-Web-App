import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #eee' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Recipe Buddy</div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/">Home</Link>
        <Link to="/recipes">Recipes</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  )
}

export default Navbar 