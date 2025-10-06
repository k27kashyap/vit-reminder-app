const express = require("express");
const router = express.Router();
const MailModel = require("../models/MailModel");

// Create a new mail
router.post("/", async (req, res) => {
  try {
    const newMail = await MailModel.create(req.body);
    res.status(201).json(newMail);
  } catch (err) {
    res.status(500).json({ message: "Error creating mail", error: err.message });
  }
});

// Get all mails for a user
router.get("/:userEmail", async (req, res) => {
  try {
    const mails = await MailModel.find({ userEmail: req.params.userEmail });
    res.json(mails);
  } catch (err) {
    res.status(500).json({ message: "Error fetching mails", error: err.message });
  }
});

// Delete a mail by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await MailModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Mail not found" });
    res.json({ message: "Mail deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting mail", error: err.message });
  }
});

module.exports = router;
