import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from "../utils/logout";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/', { replace: true });
  };

  return (
    <nav style={{ padding: '10px', background: '#eee' }}>
      <Link to="/login" style={{ margin: '10px' }}>Login</Link>
      <Link to="/register" style={{ margin: '10px' }}>Register</Link>
      <Link to="/marketplace" style={{ margin: '10px' }}>Marketplace</Link>
      <button onClick={handleLogout} style={{ marginLeft: '20px' }}>Logout</button>
    </nav>
  );
}
