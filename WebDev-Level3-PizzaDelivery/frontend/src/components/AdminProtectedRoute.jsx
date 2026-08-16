import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading-page"><h2>Loading...</h2></div>;

    if (!user) return <Navigate to="/admin-login" replace />;

    if (user.role !== "admin") return <Navigate to="/login" replace />;

    return children;
};

export default AdminProtectedRoute;
