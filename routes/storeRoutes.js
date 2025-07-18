const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const serviceKeyMiddleware = require("../middleware/serviceKeyMiddleware")
const Store = require("../models/Store")

// Example route that requires both user authentication (JWT) and service key authentication
router.get("/my-store-info", authMiddleware, serviceKeyMiddleware, async (req, res) => {
  try {
    // In a real application, you might fetch more detailed store info
    // or perform actions specific to this store and user.
    // Ensure the user's tenantId/storeId matches the service key's store/tenant.
    if (req.tenantId !== req.store.tenantId || req.storeId !== req.store.storeId) {
      return res.status(403).json({ message: "User's context does not match provided service key's store." })
    }

    res.status(200).json({
      message: "Access granted to store info",
      storeName: req.store.storeName,
      storeId: req.store.storeId,
      tenantId: req.store.tenantId,
      userRole: req.role,
      accessedByUserId: req.userId,
    })
  } catch (error) {
    console.error("Error fetching store info:", error)
    res.status(500).json({ error: error.message || "Internal server error" })
  }
})

module.exports = router
