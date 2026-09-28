const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("🚀 ~ connectDB ~ error:", error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
