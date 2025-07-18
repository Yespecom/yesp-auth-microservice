const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Store = require("../models/Store")
const Tenant = require("../models/Tenant")
const { generateTenantId, generateStoreId, generateSecretKey, generateOtp, sendEmail } = require("../utils/generate")
const { connectTenantDB } = require("../config/db") // Keep connectTenantDB for future use
const tenantSettingsSchema = require("../models/TenantSettings") // Import tenant settings schema
const tenantStoreSchema = require("../models/TenantStore") // IMPORTANT: Ensure this is imported

exports.register = async (req, res) => {
  try {
    const { name, email, password, storeName, phoneNumber, category, gstNumber } = req.body

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ message: "Required fields: name, email, password, storeName" })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      if (!existing.isEmailVerified) {
        const otp = generateOtp()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

        existing.emailVerificationOtp = otp
        existing.emailVerificationOtpExpires = otpExpires
        await existing.save()

        await sendEmail(
          email,
          "Verify Your Email for YESP Auth Service",
          `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
        )
        return res.status(200).json({
          message: "Email already registered but not verified. A new OTP has been sent to your email.",
          email,
        })
      }
      return res.status(409).json({ message: "Email already exists and is verified." })
    }

    const tenantId = generateTenantId()
    const storeId = generateStoreId()
    const secretApiKey = generateSecretKey()
    const hashedPassword = await bcrypt.hash(password, 10)

    const otp = generateOtp()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      tenantId,
      storeId,
      phoneNumber,
      isEmailVerified: false,
      emailVerificationOtp: otp,
      emailVerificationOtpExpires: otpExpires,
    })

    await Store.create({
      storeName,
      storeId,
      tenantId,
      createdBy: user._id,
      secretApiKey,
      category,
      gstNumber,
    })
    const dbName = `tenant_${tenantId.toLowerCase()}`
    await Tenant.create({ tenantId, dbName }) // Record in Main DB

    // Connect to the new tenant database and insert a default settings document
    try {
      const tenantDbConnection = await connectTenantDB(dbName)
      // Define a model on this specific tenant connection
      const TenantSettings = tenantDbConnection.model("Setting", tenantSettingsSchema)
      // Insert a dummy document to ensure the database and collection are created
      await TenantSettings.create({
        tenantId: tenantId,
        welcomeMessage: `Welcome to ${storeName}'s tenant space!`,
      })
      console.log(`✅ Default settings created in tenant DB: ${dbName}`)

      // Define a model for Store on this specific tenant connection
      const TenantStore = tenantDbConnection.model("Store", tenantStoreSchema) // Use the tenant-specific store schema
      await TenantStore.create({
        storeName,
        storeId,
        tenantId,
        category,
        gstNumber,
        createdAt: new Date(), // Ensure createdAt is set for the tenant's record
      })
      console.log(`✅ Store info replicated to tenant DB: ${dbName}`)
    } catch (tenantDbError) {
      console.error(`❌ Error initializing tenant DB ${dbName}:`, tenantDbError.message)
      // In a production scenario, you might want to rollback the user/store/tenant creation
      // if the tenant DB initialization fails, or have a retry mechanism.
    }

    await sendEmail(
      email,
      "Verify Your Email for YESP Auth Service",
      `Welcome to YESP! Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
    )

    res.status(202).json({
      message: "Registration successful. Please check your email to verify your account with the OTP.",
      email,
    })
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).json({ error: err.message || "Internal server error" })
  }
}

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified." })
    }

    if (user.emailVerificationOtp !== otp || user.emailVerificationOtpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." })
    }

    user.isEmailVerified = true
    user.emailVerificationOtp = undefined
    user.emailVerificationOtpExpires = undefined
    await user.save()

    const token = jwt.sign(
      { userId: user._id, tenantId: user.tenantId, storeId: user.storeId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )
    res.status(200).json({
      token,
      tenantId: user.tenantId,
      storeId: user.storeId,
      message: "Email verified successfully. Login successful.",
    })
  } catch (err) {
    console.error("Email verification error:", err)
    res.status(500).json({ error: err.message || "Internal server error" })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (!user.isEmailVerified) {
      const otp = generateOtp()
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

      user.emailVerificationOtp = otp
      user.emailVerificationOtpExpires = otpExpires
      await user.save()

      await sendEmail(
        email,
        "Verify Your Email for YESP Auth Service",
        `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
      )
      return res.status(403).json({
        message: "Email not verified. A new OTP has been sent to your email. Please verify to log in.",
        email,
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign(
      { userId: user._id, tenantId: user.tenantId, storeId: user.storeId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // New: Connect to the user's tenant database upon successful login
    try {
      const tenantDbName = `tenant_${user.tenantId.toLowerCase()}`
      await connectTenantDB(tenantDbName)
      console.log(`✅ Successfully connected to tenant DB '${tenantDbName}' for user ${user.email} on login.`)
    } catch (tenantConnectError) {
      console.error(`❌ Failed to connect to tenant DB on login for user ${user.email}:`, tenantConnectError.message)
      // Decide how to handle this: log, send alert, or even return a 500 if tenant DB access is critical for login success.
      // For now, we'll log and proceed with login success.
    }

    res.status(200).json({ token, tenantId: user.tenantId, storeId: user.storeId, message: "Login successful" })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: err.message || "Internal server error" })
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required." })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(200)
        .json({ message: "If an account with that email exists, a password reset OTP has been sent." })
    }

    const otp = generateOtp()
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000)

    user.passwordResetOtp = otp
    user.passwordResetOtpExpires = otpExpires
    await user.save()

    await sendEmail(
      email,
      "Password Reset OTP for YESP Auth Service",
      `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
    )

    res.status(200).json({ message: "Password reset OTP sent to your email." })
  } catch (err) {
    console.error("Forgot password error:", err)
    res.status(500).json({ error: err.message || "Internal server error" })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    if (user.passwordResetOtp !== otp || user.passwordResetOtpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.passwordResetOtp = undefined
    user.passwordResetOtpExpires = undefined
    await user.save()

    res.status(200).json({ message: "Password has been reset successfully." })
  } catch (err) {
    console.error("Reset password error:", err)
    res.status(500).json({ error: err.message || "Internal server error" })
  }
}
