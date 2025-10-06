const express = require("express");
const router = express.Router();
const ReminderModel = require("../models/ReminderModel");

// Create a new reminder
router.post("/", async (req, res) => {
  try {
    const newReminder = await ReminderModel.create(req.body);
    res.status(201).json(newReminder);
  } catch (err) {
    res.status(500).json({ message: "Error creating reminder", error: err.message });
  }
});

// Get all reminders for a user
// GET all reminders
router.get("/", async (req, res) => {
  try {
    const reminders = await ReminderModel.find();
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a reminder by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ReminderModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting reminder", error: err.message });
  }
});

module.exports = router;
