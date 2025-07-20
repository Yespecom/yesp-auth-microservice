const express = require("express")
const router = express.Router()
const {
  register,
  login,
  verifyEmailOtp, // New
  forgotPassword, // New
  resetPassword, // New
} = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/register", register)
router.post("/verify-email-otp", verifyEmailOtp) // New
router.post("/login", login)
router.post("/forgot-password", forgotPassword) // New
router.post("/reset-password", resetPassword) // New

router.get("/verify-token", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Token is valid",
    user: {
      userId: req.userId,
      tenantId: req.tenantId,
      storeId: req.storeId,
      role: req.role,
     
    },
  })
})

module.exports = router
