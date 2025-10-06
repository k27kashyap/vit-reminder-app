const express = require("express");
const { getDeadlines } = require("../services/gmailService");
// const { saveReminders } = require("./reminder");

const router = express.Router();

router.get("/scan", async (req, res) => {
  if (!req.session.tokens) return res.status(401).send("❌ Not logged in.");

  const results = await getDeadlines(req.session.tokens);
  await saveReminders(results);
  res.json(results);
});
// routes/scan.js

// Temporarily define a dummy saveReminders function
async function saveReminders(data) {
  console.log("💾 Dummy saveReminders called with:", data);
  return { message: "Dummy saveReminders success" };
}

module.exports = router;  // keep the rest of your route code as is