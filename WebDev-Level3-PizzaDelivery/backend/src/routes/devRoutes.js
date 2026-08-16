const express = require("express");
const router = express.Router();
const { getLastPreviewUrl } = require("../utils/mailer");

// GET /api/dev/last-email
router.get("/last-email", (req, res) => {
    // only allow in non-production or when DEBUG is true
    const debug = process.env.DEBUG === "true" || process.env.NODE_ENV !== "production";
    if (!debug) return res.status(404).json({ message: "Not found" });

    const url = getLastPreviewUrl();
    if (!url) return res.status(404).json({ message: "No preview available" });

    res.json({ preview: url });
});

module.exports = router;
