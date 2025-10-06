const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  userEmail: { type: String, required: true },
  remindAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  embedding: { type: [Number] } // optional for OpenAI embeddings
});

const ReminderModel = mongoose.model("Reminder", reminderSchema);

module.exports = ReminderModel;
