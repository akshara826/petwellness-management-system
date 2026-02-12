import { Navigate } from "react-router-dom";
import { authentication } from "../utils/authentication.js";

const ProtectedRoute = ({ children }) => {
  return authentication() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;