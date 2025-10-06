const ReminderModel = require("../models/ReminderModel");
const { getEmbedding } = require("./embeddingService");
const { cosineSimilarity } = require("../utils/cosineSimilarity");

const SIMILARITY_THRESHOLD = 0.85;

async function checkDuplicate(newMail) {
  const content = `${newMail.subject || ""} ${newMail.snippet || ""}`;
  const newEmbedding = await getEmbedding(content);

  const storedReminders = await ReminderModel.find({ embedding: { $exists: true } });

  for (const r of storedReminders) {
    const similarity = cosineSimilarity(newEmbedding, r.embedding);
    if (similarity > SIMILARITY_THRESHOLD) {
      return { duplicate: true, match: r };
    }
  }

  return { duplicate: false, embedding: newEmbedding };
}

module.exports = { checkDuplicate };
