require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import routes
const authRoutes = require("./routes/auth");
const wasteRoutes = require("./routes/waste");
const userRoutes = require("./routes/user");
const verifierRoutes = require("./routes/verifier");
const { router: certificateRoutes } = require("./routes/certificate");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/user", userRoutes);
app.use("/api/verifier", verifierRoutes);
app.use("/api/certificates", certificateRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Green Karma API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🌱 Welcome to Green Karma API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      waste: "/api/waste",
      user: "/api/user",
      verifier: "/api/verifier",
      certificates: "/api/certificates",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      status: 404,
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🌱 Green Karma Backend is ready!`);
});

module.exports = app;
