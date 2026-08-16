const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// VERIFY JWT TOKEN
// ==========================================

const protect = async (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. No token provided.",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user
        const user = await User.findById(decoded.userId).select(
            "-password"
        );

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists.",
            });
        }

        // Attach user to request
        req.user = user;

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token.",
        });
    }
};


// ==========================================
// ADMIN ONLY
// ==========================================

const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Not authorized.",
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admin only.",
        });
    }

    next();
};


module.exports = {
    protect,
    adminOnly,
};