const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const scanRoutes = require("./routes/scan");
const reminderRoutes = require("./routes/reminders");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use("/", authRoutes);
app.use("/", scanRoutes);
app.use("/", reminderRoutes);

// Start server
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`)
);
