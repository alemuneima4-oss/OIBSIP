import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            const res = await api.post(`/auth/reset/${token}`, { password });
            setMessage(res.data.message || "Password reset successful");
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password");
        }
    };

    return (
        <div className="reset-page">
            <h2>Reset Password</h2>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    New Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                </label>
                <button className="primary-button" type="submit">Set New Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;
