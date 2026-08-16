import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Wait until we finish checking authentication
    if (loading) {
        return (
            <div className="loading-page">
                <h2>Loading...</h2>
            </div>
        );
    }

    // User is not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated
    return children;
};

export default ProtectedRoute;