const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const Store = require("../models/Store")

// Example route that requires user authentication (JWT)
router.get("/my-store-info", authMiddleware, async (req, res) => {
  try {
    // Get store info based on user's storeId from JWT token
    const store = await Store.findOne({ storeId: req.storeId, tenantId: req.tenantId })

    if (!store) {
      return res.status(404).json({ message: "Store not found" })
    }

    res.status(200).json({
      message: "Access granted to store info",
      storeName: store.storeName,
      storeId: store.storeId,
      tenantId: store.tenantId,
      userRole: req.role,
      accessedByUserId: req.userId,
    })
  } catch (error) {
    console.error("Error fetching store info:", error)
    res.status(500).json({ error: error.message || "Internal server error" })
  }
})

module.exports = router
