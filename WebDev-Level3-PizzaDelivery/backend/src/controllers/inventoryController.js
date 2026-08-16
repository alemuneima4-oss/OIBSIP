const Inventory = require("../models/Inventory");

const getInventory = async (req, res) => {
    try {
        const items = await Inventory.find().sort({ category: 1, name: 1 });
        res.status(200).json({ count: items.length, items });
    } catch (error) {
        console.error("Get inventory error:", error);
        res.status(500).json({ message: "Server error retrieving inventory" });
    }
};

const getAvailableInventory = async (req, res) => {
    try {
        const items = await Inventory.find({ quantity: { $gt: 0 } }).sort({ category: 1, name: 1 });
        res.status(200).json({ count: items.length, items });
    } catch (error) {
        console.error("Get available inventory error:", error);
        res.status(500).json({ message: "Server error retrieving inventory" });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, lowStockThreshold } = req.body;

        const item = await Inventory.findById(id);
        if (!item) return res.status(404).json({ message: "Inventory item not found" });

        if (typeof quantity === "number") item.quantity = quantity;
        if (typeof lowStockThreshold === "number") item.lowStockThreshold = lowStockThreshold;

        await item.save();

        res.status(200).json({ message: "Inventory updated", item });
    } catch (error) {
        console.error("Update inventory error:", error);
        res.status(500).json({ message: "Server error updating inventory" });
    }
};

module.exports = {
    getInventory,
    getAvailableInventory,
    updateInventory,
};
