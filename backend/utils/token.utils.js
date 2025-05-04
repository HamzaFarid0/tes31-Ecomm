const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null; 
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
