const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "base",
                "sauce",
                "cheese",
                "vegetable",
            ],
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        lowStockThreshold: {
            type: Number,
            required: true,
            default: 20,
            min: 0,
        },

        unit: {
            type: String,
            default: "units",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Inventory", inventorySchema);