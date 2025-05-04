const jwt = require("jsonwebtoken");
const { verifyToken, generateAccessToken } = require('../utils/token.utils');
const UserModel = require('../models/user.model')

const authenticateUser = async (req, res, next) => {
  try {
    let accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {

      if (!refreshToken) {
        console.log('Refresh Token is invalid or expired')
        return res.status(401).json({ message: "Refresh Token is invalid or expired" });
      }

      const userFromRefreshToken = await UserModel.findOne({ "refreshTokens.token": refreshToken });
       console.log('userFromRefreshToken' , userFromRefreshToken)
      if (!userFromRefreshToken) {
        console.log("Invalid refresh token")
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("Refresh token verified", decoded);
      } catch (err) {
        console.log("Error verifying refresh token", err.message);
        return res.status(401).json({ message: "Refresh token is invalid or expired" });
      }

      accessToken = generateAccessToken(decoded);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, 
        sameSite: "Strict",
        maxAge: 60 * 1000
      });
    }

    let decodedAccessToken;
    try {
      decodedAccessToken = verifyToken(accessToken);
    } catch (err) {
      console.log("Access token verification failed", err.message);
      return res.status(401).json({ message: "Access token is invalid or expired" });
    }

    const userFromAccessToken = await UserModel.findById(decodedAccessToken.id)
    if (!userFromAccessToken) {
      console.log('User no longer exists')
      return res.status(401).json({ message: 'User no longer exists' });
    }
    req.user = userFromAccessToken
    console.log('Req user', req.user)
    next();
  } catch (error) {
    console.log("Error verifying token", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};


module.exports = authenticateUser