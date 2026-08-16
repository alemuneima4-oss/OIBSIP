const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        pizza: {
            base: {
                type: String,
                required: true,
            },

            sauce: {
                type: String,
                required: true,
            },

            cheese: {
                type: String,
                required: true,
            },

            vegetables: [
                {
                    type: String,
                },
            ],
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        orderStatus: {
            type: String,
            enum: [
                "Order Received",
                "In Kitchen",
                "Sent to Delivery",
                "Delivered",
                "Cancelled",
            ],
            default: "Order Received",
        },

        paymentId: {
            type: String,
            default: null,
        },

        razorpayOrderId: {
            type: String,
            default: null,
        },

        deliveryAddress: {
            address: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            phoneNumber: {
                type: String,
                required: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);