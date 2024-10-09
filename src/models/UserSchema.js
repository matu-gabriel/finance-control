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
      required: false,
    },
    google_id: {
      type: String, // Armazena o ID do Google para login social
      required: false,
      sparse: true,
    },
    picture: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.password_hash) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
