const mongoose = require("mongoose");

const mailSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  subject: { type: String },
  body: { type: String },
  sentAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const MailModel = mongoose.model("Mail", mailSchema);

module.exports = MailModel;
