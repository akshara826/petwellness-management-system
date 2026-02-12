import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import PetProfile from './components/PetProfile';
import Appointment from './components/Appointment';
import Marketplace from './components/Marketplace';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/pets" element={<ProtectedRoute><PetProfile /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;