const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/mailer");

// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "user",
        });

        // Send response
        res.status(201).json({
            message: "User registered successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration",
        });
    }
};


// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        // Don't reveal whether email exists
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Compare password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login",
        });
    }
};


// ==========================================
// GET CURRENT USER
// ==========================================

const getCurrentUser = async (req, res) => {
    try {
        // req.user is added by the protect middleware
        res.status(200).json({
            message: "User authenticated successfully",

            user: req.user,
        });

    } catch (error) {
        console.error("Get current user error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    // password reset
    forgotPassword,
    resetPassword,
};

// ==========================================
// FORGOT PASSWORD (send reset link)
// ==========================================

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(200).json({ message: "If that email exists, a reset link was sent." });

        // create token
        const token = crypto.randomBytes(32).toString("hex");
        const hashed = crypto.createHash("sha256").update(token).digest("hex");

        user.passwordResetToken = hashed;
        user.passwordResetExpires = Date.now() + 1000 * 60 * 60; // 1 hour
        await user.save();

        const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontend}/reset-password/${token}`;

        const subject = "Password reset for PizzaHub";
        const text = `You requested a password reset. Click the link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, ignore.`;

        await sendEmail({ to: user.email, subject, text });

        res.status(200).json({ message: "If that email exists, a reset link was sent." });

    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

// ==========================================
// RESET PASSWORD
// ==========================================

async function resetPassword(req, res) {
    try {
        const token = req.params.token;
        const { password } = req.body;

        if (!token) return res.status(400).json({ message: "Token is required" });
        if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

        const hashed = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        // send confirmation
        await sendEmail({ to: user.email, subject: "Password changed", text: "Your password has been updated." });

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Server error" });
    }
}