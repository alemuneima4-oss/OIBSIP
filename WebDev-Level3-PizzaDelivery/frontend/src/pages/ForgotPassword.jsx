import { useState } from "react";
import api from "../api/axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            const res = await api.post("/auth/forgot", { email });
            setMessage(res.data.message || "If that email exists, a reset link was sent.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset link");
        }
    };

    return (
        <div className="forgot-page">
            <h2>Forgot Password</h2>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <button className="primary-button" type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
