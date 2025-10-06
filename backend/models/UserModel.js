const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional if using OAuth
  googleId: { type: String }, // for Google OAuth
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
