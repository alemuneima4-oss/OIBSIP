const mongoose = require("mongoose");

const pizzaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        image: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            enum: [
                "Classic",
                "Special",
                "Vegetarian",
                "Spicy",
            ],
            default: "Classic",
        },

        available: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent OverwriteModelError during development
const Pizza =
    mongoose.models.Pizza ||
    mongoose.model("Pizza", pizzaSchema);

module.exports = Pizza;