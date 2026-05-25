const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const translateRoutes = require("./routes/translateRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", translateRoutes);

app.use("/api/auth", authRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.log("GLOBAL ERROR:");
  console.log(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
