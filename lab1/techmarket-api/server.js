const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan");
const {
  errorHandler,
  notFoundHandler,
} = require("./src/middleware/errorHandling");

const productRoutes = require("./src/routes/productRoutes");
const port = process.env.PORT || 3000;
require("./src/config/db");

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/products", productRoutes);

app.use(errorHandler);
app.use(notFoundHandler);

app.listen(port, () => {
  console.log("🚀 Serwer działa na porcie 3000");
});
