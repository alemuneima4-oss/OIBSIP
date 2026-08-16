const express = require("express");

const {
    registerUser,
    loginUser,
    getCurrentUser,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");

const {
    protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// REGISTER
// POST /api/auth/register
// ==========================================

router.post("/register", registerUser);

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

router.post("/login", loginUser);

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// Protected route
// ==========================================

router.get("/me", protect, getCurrentUser);

// FORGOT PASSWORD
router.post("/forgot", forgotPassword);

// RESET PASSWORD
router.post("/reset/:token", resetPassword);

module.exports = router;