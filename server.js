import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";

dotenv.config();

// Load Swagger file
const swaggerDocument = yaml.load("./swagger.yaml");

const app = express();
app.use(express.json());

// Swagger UI Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// VERY SIMPLE ROOT ROUTE
app.get("/", (req, res) => {
  console.log(" ROOT / hit");
  res.send("Hello from THIS server");
});

// SIMPLE TEST ROUTE
app.get("/test", (req, res) => {
  console.log(" /test endpoint hit");
  res.send("Test OK");
});
// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));
// Routes
app.use("/api/auth", authRoutes);
// Start server
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
