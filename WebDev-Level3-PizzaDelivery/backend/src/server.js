const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// Routes
// ===============================
const authRoutes = require("./routes/authRoutes");
const pizzaRoutes = require("./routes/pizzaRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const devRoutes = require("./routes/devRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/pizzas", pizzaRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
    // Dev routes (only in debug/non-production)
    if (process.env.DEBUG === "true" || process.env.NODE_ENV !== "production") {
        app.use("/api/dev", devRoutes);
    }

// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "Pizza Delivery API is running!"
    });
});

// ===============================
// MongoDB Connection
// ===============================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

// ===============================
// Start Server
// ===============================

const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Socket.io
    const { Server } = require("socket.io");
    const io = new Server(server, {
        cors: {
            origin: true,
            methods: ["GET", "POST"],
        },
    });

    // attach io to app for controllers
    app.set("io", io);

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // join room for user id
        socket.on("join", (userId) => {
            if (userId) socket.join(userId);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    // start low-stock notifier job (separate module)
    try {
        const { startLowStockNotifier } = require("./jobs/lowStockNotifier");
        startLowStockNotifier();
    } catch (err) {
        console.warn("Low stock notifier not started:", err.message || err);
    }
};

startServer();