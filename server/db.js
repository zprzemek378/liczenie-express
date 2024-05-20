const mongoose = require("mongoose");

const connectionString = process.env.DATABASE_URL;

mongoose
  .connect(connectionString)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

module.exports = mongoose.connection;
