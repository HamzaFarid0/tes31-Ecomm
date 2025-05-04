const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.EMAIL_PASS, 
    },
    tls: {
      rejectUnauthorized: false,  
    },
  });
  
  
  

const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Hamza Farid" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your OTP Code for Email Verification",
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email} ✅`);
  } catch (error) {
    console.error("Error sending OTP email ❌", error);
  }
};

module.exports = sendOTPEmail;
