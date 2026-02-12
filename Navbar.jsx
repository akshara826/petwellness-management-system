import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px', background: '#eee' }}>
      <Link to="/login" style={{ margin: '10px' }}>Login</Link>
      <Link to="/register" style={{ margin: '10px' }}>Register</Link>
      <Link to="/pets" style={{ margin: '10px' }}>Pet Profiles</Link>
      <Link to="/appointments" style={{ margin: '10px' }}>Appointments</Link>
      <Link to="/marketplace" style={{ margin: '10px' }}>Marketplace</Link>
      <button onClick={handleLogout} style={{ marginLeft: '20px' }}>Logout</button>
    </nav>
  );
}
