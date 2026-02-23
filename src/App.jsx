import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Marketplace from "./pages/Marketplace";
import Register from "./pages/Register";
import SetPassword from "./pages/SetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/marketplace" element={<Marketplace />} />
    </Routes>
  );
}

export default App;
