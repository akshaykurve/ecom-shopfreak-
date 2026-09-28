const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const { connectDB } = require("./config/db");
const sanitizeInput = require("./middlewares/sanitize.middleware");
const { authLimiter } = require("./middlewares/rateLimit.middleware");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler.middleware");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");

const app = express();

connectDB();

// Behind a reverse proxy (Render, Railway, Heroku, ...) this is required for
// secure cookies and req.ip to work correctly.
app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(sanitizeInput);

app.get("/", (req, res) => {
  res.json({ success: true, message: "ShopFreak API is running" });
});

// Unauthenticated, unrate-limited endpoint for uptime monitors / platform
// health checks (Render, Railway, k8s, ...). Reports 503 if MongoDB isn't
// connected, since "the process is alive" isn't the same as "the API works".
app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status: dbConnected ? "ok" : "degraded",
    db: dbConnected ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
