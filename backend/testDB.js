require("dotenv").config();
const mongoose = require("mongoose");

const testDbUri = process.env.MONGO_URI_TEST;

mongoose
  .connect(testDbUri)
  .then(() => {
    console.log("✅ Connected to TEST database!");
    return mongoose.connection.db.listCollections().toArray(); // list collections
  })
  .then((collections) => {
    console.log("Collections in test DB:", collections);
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Test DB connection error:", err);
  });
