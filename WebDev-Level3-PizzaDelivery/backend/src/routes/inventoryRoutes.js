const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getInventory, getAvailableInventory, updateInventory } = require("../controllers/inventoryController");

// GET /api/inventory -- admin only
router.get("/", protect, adminOnly, getInventory);

// GET /api/inventory/available -- public
router.get("/available", getAvailableInventory);

// PATCH /api/inventory/:id -- admin only
router.patch("/:id", protect, adminOnly, updateInventory);

module.exports = router;
