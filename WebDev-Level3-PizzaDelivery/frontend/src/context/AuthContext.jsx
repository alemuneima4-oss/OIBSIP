import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { io as ioClient } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    // ==========================================
    // GET CURRENT USER
    // ==========================================

    const getCurrentUser = async () => {
        try {
            const response = await api.get("/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data.user);

        } catch (error) {
            console.error(
                "Failed to get current user:",
                error.response?.data?.message
            );

            logout();

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // LOGIN
    // ==========================================

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        const receivedToken = response.data.token;

        localStorage.setItem("token", receivedToken);

        setToken(receivedToken);
        setUser(response.data.user);

        return response.data;
    };


    // ==========================================
    // REGISTER
    // ==========================================

    const register = async (name, email, password) => {
        const response = await api.post("/auth/register", {
            name,
            email,
            password,
        });

        return response.data;
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {
        localStorage.removeItem("token");

        setToken(null);
        setUser(null);
        setLoading(false);
    };


    // ==========================================
    // CHECK LOGIN ON PAGE LOAD
    // ==========================================

    useEffect(() => {
        if (token) {
            getCurrentUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    // Socket.io: connect and join user room when authenticated
    useEffect(() => {
        if (!token) return;

        const sock = ioClient("http://localhost:5000", { auth: { token } });

        sock.on("connect", () => {
            const userId = user?.id || user?._id;
            if (userId) sock.emit("join", userId);
            setSocket(sock);
        });

        // If user becomes available after socket connected, join room
        if (sock.connected && (user?.id || user?._id)) {
            const uid = user?.id || user?._id;
            sock.emit("join", uid);
        }

        sock.on("order:status", (payload) => {
            console.log("Order status update:", payload);
        });

        sock.on("order:update", (payload) => {
            console.log("Order update:", payload);
        });

        return () => {
            try {
                sock.disconnect();
            } catch (e) {}
            setSocket(null);
        };
    }, [token, user]);


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                socket,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = () => {
    return useContext(AuthContext);
};