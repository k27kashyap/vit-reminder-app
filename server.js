const express = require("express");
const session = require("express-session");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const chrono = require("chrono-node");

dotenv.config();

const app = express();
app.use(session({ secret: "vit-secret", resave: false, saveUninitialized: true }));

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// Step 1: Redirect user to Google OAuth
app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  res.redirect(url);
});

// Step 2: Google callback → get tokens
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  req.session.tokens = tokens;
  res.send("✅ Auth complete! Now go to /scan to detect deadlines.");
});

// Step 3: Fetch Gmail + scan deadlines
app.get("/scan", async (req, res) => {
  if (!req.session.tokens) return res.send("❌ Not logged in. Go to /auth first.");

  oauth2Client.setCredentials(req.session.tokens);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // fetch latest 10 inbox emails
  const listRes = await gmail.users.messages.list({ userId: "me", maxResults: 10, labelIds: ["INBOX"] });
  const messages = listRes.data.messages || [];

  let results = [];

  for (const msg of messages) {
    const m = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "full" });

    const snippet = m.data.snippet || "";
    const subjectHeader = m.data.payload.headers.find((h) => h.name === "Subject");
    const subject = subjectHeader ? subjectHeader.value : "";

    const text = subject + " " + snippet;
    const keywords = /(deadline|last date|submit by|due by|application)/i;

    if (keywords.test(text)) {
      const parsed = chrono.parse(text);
      if (parsed.length > 0) {
        results.push({
          subject,
          snippet,
          detectedDate: parsed[0].start.date(),
        });
      }
    }
  }

  console.log("Detected deadlines:", results);
  res.json(results);
});

app.listen(process.env.PORT, () => console.log(`🚀 Server running at http://localhost:${process.env.PORT}`));
