import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CustomPizza from "./pages/CustomPizza";
import OrderSummary from "./pages/OrderSummary";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ==================================
                    DEFAULT
                ================================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* ==================================
                    AUTHENTICATION
                ================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/reset-password/:token" element={<ResetPassword />} />


                {/* ==================================
                    PROTECTED USER DASHBOARD
                ================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/custom-pizza"
                    element={
                        <ProtectedRoute>
                            <CustomPizza />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/order-summary"
                    element={
                        <ProtectedRoute>
                            <OrderSummary />
                        </ProtectedRoute>
                    }
                />

                <Route path="/admin-login" element={<AdminLogin />} />

                <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard/></AdminProtectedRoute>} />

            </Routes>

        </BrowserRouter>
    );
}

export default App;