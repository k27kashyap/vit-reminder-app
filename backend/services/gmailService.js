const { google } = require("googleapis");
const chrono = require("chrono-node");

const ALLOWED_SENDERS = [
  "placement@vitap.ac.in",
  "helpdesk.cdc@vit.ac.in",
  "students.cdc2026@vitap.ac.in"
];

function extractCompany(subject) {
  const parts = subject.split(" - ");
  return parts[0]?.trim() || subject;
}

function extractRole(subject) {
  const parts = subject.split(" - ");
  return parts[1]?.trim() || "Unknown Role";
}

async function getDeadlines(tokens) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials(tokens);

  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: "newer_than:30d",
    maxResults: 20,
  });

  if (!res.data.messages) return [];

  const messages = await Promise.all(
    res.data.messages.map((m) =>
      gmail.users.messages.get({ userId: "me", id: m.id, format: "full" })
    )
  );

  const reminders = [];

  for (let msg of messages) {
    const headers = msg.data.payload.headers;
    const subject = headers.find(h => h.name === "Subject")?.value || "";
    const from = headers.find(h => h.name === "From")?.value || "";

    if (!ALLOWED_SENDERS.some(s => from.toLowerCase().includes(s.toLowerCase()))) continue;

    let body = "";
    if (msg.data.payload.parts) {
      for (const part of msg.data.payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body += Buffer.from(part.body.data, "base64").toString("utf-8");
        }
      }
    } else if (msg.data.payload.body?.data) {
      body = Buffer.from(msg.data.payload.body.data, "base64").toString("utf-8");
    }

    const fullText = subject + "\n" + body;
    const parsedDates = chrono.parse(fullText);
    const company = extractCompany(subject);
    const role = extractRole(subject);

    parsedDates.forEach((p) => {
      reminders.push({
        subject,
        snippet: msg.data.snippet,
        detectedDate: p.start.date(),
        sender: from,
        company,
        role,
      });
    });
  }

  const unique = {};
  reminders.forEach((r) => {
    const key = r.company + "_" + r.role;
    if (!unique[key]) {
      unique[key] = r;
    } else {
      const oldDate = new Date(unique[key].detectedDate);
      const newDate = new Date(r.detectedDate);
      if (newDate.getTime() !== oldDate.getTime()) {
        unique[key].detectedDate = newDate;
        unique[key].snippet = r.snippet;
      }
    }
  });

  return Object.values(unique);
}

module.exports = { getDeadlines };
