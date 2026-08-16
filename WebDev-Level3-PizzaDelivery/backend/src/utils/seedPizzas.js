require("dotenv").config();

const mongoose = require("mongoose");
const Pizza = require("../models/Pizza");

const pizzas = [
    {
        name: "Margherita",
        description:
            "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
        price: 8.99,
        image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
        category: "Classic",
        available: true,
    },

    {
        name: "Pepperoni",
        description:
            "Loaded with mozzarella cheese and delicious pepperoni.",
        price: 10.99,
        image:
            "https://images.unsplash.com/photo-1628840042765-356cda07504e",
        category: "Classic",
        available: true,
    },

    {
        name: "Vegetarian",
        description:
            "Fresh vegetables, mozzarella, tomato sauce, and herbs.",
        price: 9.99,
        image:
            "https://images.unsplash.com/photo-1579751626657-72bc17010498",
        category: "Vegetarian",
        available: true,
    },

    {
        name: "Spicy Chicken",
        description:
            "Spicy chicken, mozzarella, peppers, and special sauce.",
        price: 12.99,
        image:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
        category: "Spicy",
        available: true,
    },

    {
        name: "Supreme",
        description:
            "A delicious combination of meat, vegetables, cheese, and sauce.",
        price: 14.99,
        image:
            "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a",
        category: "Special",
        available: true,
    },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected.");

        await Pizza.deleteMany();

        await Pizza.insertMany(pizzas);

        console.log("🍕 Pizza data inserted successfully.");

        await mongoose.connection.close();

        console.log("Database connection closed.");

        process.exit(0);

    } catch (error) {
        console.error("Seed error:", error);

        process.exit(1);
    }
};

seedDatabase();