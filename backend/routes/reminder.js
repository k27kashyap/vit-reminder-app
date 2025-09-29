const express = require("express");
const router = express.Router();

let reminders = []; // in-memory

router.get("/reminders", (req, res) => {
  res.json(reminders);
});

function saveReminders(newReminders) {
  reminders = newReminders;
}

module.exports = router;
module.exports.saveReminders = saveReminders;
