const Pizza = require("../models/Pizza");

// ==========================================
// GET ALL AVAILABLE PIZZAS
// ==========================================

const getPizzas = async (req, res) => {
    try {
        const pizzas = await Pizza.find({
            available: true,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            message: "Pizzas retrieved successfully",
            count: pizzas.length,
            pizzas,
        });

    } catch (error) {
        console.error("Get pizzas error:", error);

        res.status(500).json({
            message: "Server error while retrieving pizzas",
        });
    }
};


// ==========================================
// GET SINGLE PIZZA
// ==========================================

const getPizzaById = async (req, res) => {
    try {
        const pizza = await Pizza.findOne({
            _id: req.params.id,
            available: true,
        });

        if (!pizza) {
            return res.status(404).json({
                message: "Pizza not found",
            });
        }

        res.status(200).json({
            message: "Pizza retrieved successfully",
            pizza,
        });

    } catch (error) {
        console.error("Get pizza error:", error);

        res.status(500).json({
            message: "Server error while retrieving pizza",
        });
    }
};


module.exports = {
    getPizzas,
    getPizzaById,
};