const { google } = require("googleapis");
const chrono = require("chrono-node");

const ALLOWED_SENDERS = [
  "placement@vitap.ac.in",
  "helpdesk.cdc@vit.ac.in",
];

async function getDeadlines(tokens) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials(tokens);

  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: "newer_than:30d", // change to "newer_than:30d is:unread" for unread only
    maxResults: 20,
  });

  if (!res.data.messages) return [];

  const messages = await Promise.all(
    res.data.messages.map((m) =>
      gmail.users.messages.get({ userId: "me", id: m.id })
    )
  );

  const reminders = [];

  for (let msg of messages) {
    const headers = msg.data.payload.headers;
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "";
    const from = headers.find((h) => h.name === "From")?.value || "";
    const snippet = msg.data.snippet;

    // filter senders
    if (!ALLOWED_SENDERS.some((s) => from.includes(s))) continue;

    const parsedDate = chrono.parseDate(snippet + " " + subject);

    if (parsedDate) {
      reminders.push({
        subject,
        snippet,
        detectedDate: parsedDate,
        sender: from,
      });
    }
  }

  // deduplicate by subject (keep latest)
  const unique = {};
  reminders.forEach((r) => {
    if (
      !unique[r.subject] ||
      new Date(r.detectedDate) >
        new Date(unique[r.subject].detectedDate)
    ) {
      unique[r.subject] = r;
    }
  });

  return Object.values(unique);
}

module.exports = { getDeadlines };
