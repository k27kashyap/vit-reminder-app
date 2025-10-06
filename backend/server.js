
const dotenv = require("dotenv");
dotenv.config();  // ✅ Must load first

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const scanRoutes = require("./routes/scan");
const reminderRoutes = require("./routes/reminder");

const app = express();

// ✅ MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Atlas connected"))
.catch(err => console.error("❌ MongoDB Atlas connection error:", err));

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
app.use("/reminder", reminderRoutes);

// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at : http://localhost:${process.env.PORT}/auth`);
});
