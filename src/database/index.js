import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connect successfully");
    process.exit(0);
  } catch (err) {
    console.error("DB connection erro:", err.messege);
    process.exit(1);
  }
};

export default connectDB;
