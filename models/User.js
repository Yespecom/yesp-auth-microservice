const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tenantId: { type: String, required: true },
  storeId: { type: String, required: true },
  role: { type: String, default: "admin" },
  phoneNumber: String, // New: To store phone number
  isEmailVerified: { type: Boolean, default: false }, // New: Email verification status
  emailVerificationOtp: String, // New: OTP for email verification
  emailVerificationOtpExpires: Date, // New: Expiry for email verification OTP
  passwordResetOtp: String, // New: OTP for password reset
  passwordResetOtpExpires: Date, // New: Expiry for password reset OTP
})

module.exports = mongoose.model("User", userSchema)
