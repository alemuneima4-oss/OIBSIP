const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const getRazorpay = () => {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay keys not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)");
    }
    return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
};

// Create Razorpay order and local Order document
const createOrder = async (req, res) => {
    try {
        const { pizza, quantity, totalPrice, deliveryAddress } = req.body;

        if (!pizza || !quantity || !totalPrice || !deliveryAddress) {
            return res.status(400).json({ message: "Missing order data" });
        }

        const { address, city, phoneNumber } = deliveryAddress;
        if (!address || !city || !phoneNumber) {
            return res.status(400).json({ message: "Missing delivery address fields" });
        }

        // create local order
        const order = await Order.create({
            user: req.user._id,
            pizza,
            quantity,
            totalPrice,
            deliveryAddress: {
                address,
                city,
                phoneNumber,
            },
            paymentStatus: "pending",
        });

        // create razorpay order (or fallback to test-mode order)
        const options = {
            amount: Math.round(totalPrice * 100),
            currency: "INR",
            receipt: order._id.toString(),
        };

        let rzOrder = null;
        let testMode = false;

        try {
            const rz = getRazorpay();
            rzOrder = await rz.orders.create(options);
            order.razorpayOrderId = rzOrder.id;
            await order.save();
        } catch (err) {
            // Razorpay keys missing or error — enable test fallback
            console.warn("Razorpay not configured, creating test-mode order.", err.message || err);
            testMode = true;
            rzOrder = {
                id: `test_order_${order._id}`,
                amount: options.amount,
                currency: options.currency,
            };
            order.razorpayOrderId = rzOrder.id;
            await order.save();
        }

        // emit order created so frontend dashboards can show it immediately
        try {
            const io = req.app.get("io");
            if (io) io.to(order.user.toString()).emit("order:update", { orderId: order._id, orderStatus: order.orderStatus });
        } catch (e) {
            console.warn("Failed to emit order creation event", e.message || e);
        }

        res.status(201).json({ message: "Order created", order, razorpayOrder: rzOrder, testMode });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ message: "Server error creating order" });
    }
};

// Verify payment signature and mark order paid
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({ message: "Missing verification fields" });
        }

        // If Razorpay secret missing, accept verification in test-mode
        if (process.env.RAZORPAY_KEY_SECRET) {
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: "Invalid signature" });
            }
        } else {
            console.warn("Razorpay secret not set — accepting payment verification in test mode.");
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // idempotent: if already marked paid, don't decrement again
        if (order.paymentStatus === "paid") {
            return res.status(200).json({ message: "Payment already verified", order });
        }

        order.paymentStatus = "paid";
        order.paymentId = razorpay_payment_id;
        await order.save();

        // decrement inventory based on pizza selections
        const qty = order.quantity || 1;

        const decrements = [];

        if (order.pizza.base) {
            decrements.push(
                Inventory.findOneAndUpdate(
                    { name: order.pizza.base },
                    { $inc: { quantity: -1 * qty } },
                    { new: true }
                )
            );
        }

        if (order.pizza.sauce) {
            decrements.push(
                Inventory.findOneAndUpdate(
                    { name: order.pizza.sauce },
                    { $inc: { quantity: -1 * qty } },
                    { new: true }
                )
            );
        }

        if (order.pizza.cheese) {
            decrements.push(
                Inventory.findOneAndUpdate(
                    { name: order.pizza.cheese },
                    { $inc: { quantity: -1 * qty } },
                    { new: true }
                )
            );
        }

        if (Array.isArray(order.pizza.vegetables)) {
            order.pizza.vegetables.forEach((veg) => {
                decrements.push(
                    Inventory.findOneAndUpdate(
                        { name: veg },
                        { $inc: { quantity: -1 * qty } },
                        { new: true }
                    )
                );
            });
        }

        await Promise.all(decrements);

        // emit socket update
        const io = req.app.get("io");
        if (io) io.to(order.user.toString()).emit("order:update", { orderId: order._id, orderStatus: order.orderStatus });

        res.status(200).json({ message: "Payment verified and order marked paid", order });

    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Server error verifying payment" });
    }
};

// Get orders for current user
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ count: orders.length, orders });
    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({ message: "Server error retrieving orders" });
    }
};

// Admin: get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ count: orders.length, orders });
    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({ message: "Server error retrieving orders" });
    }
};

// Admin: update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.orderStatus = orderStatus;
        await order.save();

        const io = req.app.get("io");
        if (io) io.to(order.user.toString()).emit("order:status", { orderId: order._id, orderStatus });

        res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ message: "Server error updating order status" });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getUserOrders,
    updateOrderStatus,
    getAllOrders,
};
