const nodemailer = require("nodemailer");
const db = require("../models");
const OTP = db.otp;
const config = require("../config/db.config");

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: config.SMTP.service,
  auth: {
    user: config.SMTP.user,
    pass: config.SMTP.pass,
  },
});

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email and store it in the database
exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Store OTP in the database
    await OTP.create({ email, otp, expiresAt });

    // Send OTP email
    const mailOptions = {
      from: config.SMTP.user,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    RESPONSE.Success.Message = MESSAGE.OTP_SENT;
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(StatusCode.OK.code).send({ message: 'OTP sent successfully!' });
  } catch (error) {
    console.error("Error sending OTP:", error);
    RESPONSE.Failure.Message = MESSAGE.OTP_FAILED;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).send({ message: 'Failed to send OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpData = await OTP.findOne({ where: { email, otp } });

    if (!otpData) {
      RESPONSE.Success.Message = MESSAGE.INVALID_OTP;
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(400).send({ message: 'Invalid OTP' });
    }

    if (otpData.expiresAt < Date.now()) {
      await OTP.destroy({ where: { email, otp } }); // Remove expired OTP
      RESPONSE.Success.Message = MESSAGE.OTP_EXPIRED;
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(400).send({ message: 'OTP expired' });
    }

    await OTP.destroy({ where: { email, otp } }); // OTP verified, delete it
    RESPONSE.Success.Message = MESSAGE.OTP_VERIFIED;
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).send({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    RESPONSE.Failure.Message = MESSAGE.OTP_VERIFICATION_FAILED;
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).send({ message: 'Failed to verify OTP' });
  }
};
