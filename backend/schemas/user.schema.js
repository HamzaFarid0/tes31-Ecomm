const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, 
  refreshTokens: [
    {
      token: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date }
    }
  ],
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = UserSchema
