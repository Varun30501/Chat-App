// models/User.js
import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profilePic: { type: String, default: "" },
  bio: { type: String },
}, { timestamps: true });

userSchema.methods.getResetPasswordToken = function(){

  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;

}

const User = mongoose.model("User", userSchema);

export default User;