const express = require("express");
const { getDeadlines } = require("../services/gmailService");
const { saveReminders } = require("./reminders");

const router = express.Router();

router.get("/scan", async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).send("❌ Not logged in. Go to /auth first.");
  }

  const results = await getDeadlines(req.session.tokens);
  saveReminders(results);
  res.json(results);
});

module.exports = router;
