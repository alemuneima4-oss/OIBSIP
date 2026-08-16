const express = require("express");

const {
    getPizzas,
    getPizzaById,
} = require("../controllers/pizzaController");

const router = express.Router();


// GET /api/pizzas
router.get("/", getPizzas);


// GET /api/pizzas/:id
router.get("/:id", getPizzaById);


module.exports = router;