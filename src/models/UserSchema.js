import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
