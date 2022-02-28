const express = require("express");
const cors = require("cors");

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const ordersRouter = require("./orders/orders.router");
const dishesRouter = require("./dishes/dishes.router");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// PIPELINE
app.use("/dishes", dishesRouter);
app.use("/orders", ordersRouter);

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

module.exports = app;
