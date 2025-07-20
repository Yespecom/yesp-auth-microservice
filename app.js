require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const storeRoutes = require("./routes/storeRoutes");
const statusRoutes = require("./routes/statusRoutes");
const { connectMainDB } = require("./config/db");

// 🚫 Removed CORS middleware (handled by NGINX)

// ✅ Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to database
connectMainDB();

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/dashboard", storeRoutes); // Same as storeRoutes
app.use("/api/status", statusRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "YESP Auth Service is running!" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
