require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Inventory = require("../models/Inventory");
const User = require("../models/User");

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected for seeding.");

        // Seed inventory
        const items = [
            { name: "Thin Crust", category: "base", quantity: 100 },
            { name: "Thick Crust", category: "base", quantity: 80 },
            { name: "Tomato Sauce", category: "sauce", quantity: 200 },
            { name: "Pesto Sauce", category: "sauce", quantity: 50 },
            { name: "Mozzarella", category: "cheese", quantity: 150 },
            { name: "Cheddar", category: "cheese", quantity: 60 },
            { name: "Bell Pepper", category: "vegetable", quantity: 120 },
            { name: "Onion", category: "vegetable", quantity: 130 },
            { name: "Olives", category: "vegetable", quantity: 90 },
        ];

        await Inventory.deleteMany();
        await Inventory.insertMany(items);

        console.log("Inventory seeded.");

        // Seed admin user
        const adminEmail = process.env.ADMIN_EMAIL || "admin@pizzahub.test";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        await User.deleteMany({ email: adminEmail });

        const hashed = await bcrypt.hash(adminPassword, 10);

        const admin = await User.create({ name: "Admin", email: adminEmail, password: hashed, role: "admin", isVerified: true });

        console.log("Admin user created:", admin.email, "password:", adminPassword);

        await mongoose.connection.close();

        console.log("Seeding complete.");
        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seed();
