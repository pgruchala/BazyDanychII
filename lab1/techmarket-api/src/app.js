const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandling");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");

const userRoutes = require("./routes/userRoutes");
const requestLogger = require("./middleware/requestLogger");

dotenv.config();
const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);

app.use(errorHandler);

module.exports = app;
