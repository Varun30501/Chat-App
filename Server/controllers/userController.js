// controllers/userController.js
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { PASSWORD_RESET_TEMPLATE } from "../utils/emailTemplates.js";


// Signup a new user
export const signup = async (req, res) =>{
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({success: false, message: "Missing Details"})
        }
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false, message: "Account already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id);

        res.json({success: true, userData: newUser, token, message: "Account created successfully"})

    }catch (error) {
            console.log(error.message);
            res.json({success: false, message: error.message})
    }

}

// controller to login a user
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email});
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({success: false, message: "Invalid Credentials"});
        }
        const token = generateToken(userData._id);
        res.json({success: true, userData, token, message: "Login successful"});
    }catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({success: true, user: req.user});
}

// Controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const {profilePic, bio, fullName} = req.body;
        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        res.json({success: true, userData: updatedUser});
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      template: PASSWORD_RESET_TEMPLATE,
      variables: {
        email: user.email,
        otp: otp
      }
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {

    console.error("🔥 Forgot password error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

export const resetPassword = async (req, res) => {

  try {

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password required"
      });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {

    console.error("🔥 Reset password error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};