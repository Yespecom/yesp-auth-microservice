const crypto = require("crypto")
const nodemailer = require("nodemailer")

exports.generateTenantId = () => `TENANT-${Date.now()}`
exports.generateStoreId = () => `STORE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
exports.generateSecretKey = () => `yesp_${crypto.randomBytes(24).toString("hex")}`

// Generate a 6-digit numeric OTP
exports.generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: 465, // true for 465 (SSL), false for other ports (like 587 for TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Send email function using Nodemailer
exports.sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender address
      to: to, // List of recipients
      subject: subject, // Subject line
      text: text, // Plain text body
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email sent to ${to}: ${info.messageId}`)
    return true
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error)
    return false
  }
}
