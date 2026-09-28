import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

// No user -> mirrors the backend's 401 (not logged in) by sending to /login.
// Logged in but wrong role -> mirrors the backend's 403 by sending home.
function ProtectedRoute({ allowedRoles }) {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
