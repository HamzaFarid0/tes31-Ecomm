const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const UserModel = require('../models/user.model')
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/token.utils');
const sendOTPEmail = require('../utils/mailer')
const { isValidEmail } = require('../utils/validator')
const redisConnect = require('../redis-connect/redis.connect')

require('dotenv').config()

const signup = async (req, res) => {
  try {
    console.log("Received Data:", req.body);  

    const { username, email, password } = req.body;

    const errors = {};

    //  Field validations
    if (!username) {
      errors.username = "Username is required";
    }
  
    if (!email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Email is invalid";
    }
  
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
  
    //  Return 400 if there are validation errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
  
    //  Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        errors: { email: "User with this email already exists" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user with isVerified: false, store hashed password
    const newUser = await UserModel.create({ username, email, password: hashedPassword, isVerified: false });

    // Generate OTP (6-digit)
    const otp = crypto.randomInt(100000, 999999).toString();

    await redisConnect.setex(`otp:${email}`, 600 , otp);

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Internal server error while signing up");
    res.status(500).json({ message: "Internal server error while signing up" });
  }
}

//  Verify OTP
const verifyOTP = async (req, res) => {
  try {

    const { otp, email } = req.body;
    if (!otp || !email) {
      return res.status(400).json({ message: "Both otp and email is required" });
    }

    // Get stored OTP from Redis
    const storedOTP = await redisConnect.get(`otp:${email}`);
    if (!storedOTP) {
      console.log('OTP expired')
      return res.status(400).json({ message: "OTP expired, request for new OTP" });
    }
    if (storedOTP !== otp) {
      console.log('Invalid OTP')
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Remove OTP from Redis
    await redisConnect.del(`otp:${email}`);

    //  Update user's isVerified to true
    const verifiedUser = await UserModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!verifiedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Email verified successfully + User saved to DB:", verifiedUser);
    res.json({ message: "Email verified successfully + User saved to DB:", verifiedUser });
  } catch (error) {
    console.error("Internal Server Error verifying OTP", error);
    res.status(500).json({ message: "Internal Server Error verifying OTP" });
  }
};

const resendOtp = async (req, res) => {
  console.log('resend otp' ,req.body)
  const { email  } = req.body;

  const otp = crypto.randomInt(100000, 999999).toString();

  await redisConnect.setex(`otp:${email}`, 600, otp);

  await sendOTPEmail(email, otp);
}

const login = async (req, res) => {
  try {
    console.log('Received Login Data: ' , req.body)
    const { email, password } = req.body;

    const errors = {};

    //  Email validation
    if (!email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Email format is invalid";
    }

    //  Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
  
    //  Return validation errors before querying DB
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
  
    const user = await UserModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ errors: { general: "Invalid credentials"}, });
    }

        //  Clean expired tokens before adding new one
     user.refreshTokens = user.refreshTokens.filter(tokenObj => {
       return tokenObj.expiresAt > new Date();
     });

    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id, email: user.email });

    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    });
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,     
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",  
      maxAge: 7 * 24 * 60 * 60 * 1000,  
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error during log in:", error);
    res.status(500).json({ message: "Error during log in", error });
  }
};

const logout = async (req, res) =>{
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Remove refresh token from DB
    const user = await UserModel.findOne({ 'refreshTokens.token': refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    user.refreshTokens = user.refreshTokens.filter((rtoken) => rtoken.token !== refreshToken);
    await user.save();

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    console.log("Logged out successfully")
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error during logout")
    res.status(500).json({ message: "Error during logout", error });
  }
}

module.exports = { signup, verifyOTP, resendOtp, login, logout }