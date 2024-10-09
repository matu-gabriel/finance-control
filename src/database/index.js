import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log("Trying to connect to MongoDB");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connect successfully");
  } catch (err) {
    console.error("DB connection erro:", err.message);
  }
};

export default connectDB;
