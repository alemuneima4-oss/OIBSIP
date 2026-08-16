const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
    createOrder,
    verifyPayment,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
} = require("../controllers/orderController");

// POST /api/orders/create
router.post("/create", protect, createOrder);

// POST /api/orders/verify
router.post("/verify", protect, verifyPayment);

// GET /api/orders/me
router.get("/me", protect, getUserOrders);

// GET /api/orders -- admin only (list all orders)
router.get("/", protect, adminOnly, getAllOrders);

// PATCH /api/orders/:id/status -- admin only
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
