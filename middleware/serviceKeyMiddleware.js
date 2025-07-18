const Store = require("../models/Store")

const serviceKeyMiddleware = async (req, res, next) => {
  const serviceKey = req.headers["x-api-key"]

  if (!serviceKey) {
    return res.status(401).json({ message: "X-API-Key header is required, authorization denied" })
  }

  try {
    const store = await Store.findOne({ secretApiKey: serviceKey })

    if (!store) {
      return res.status(403).json({ message: "Invalid X-API-Key" })
    }

    // Attach store information to the request for downstream use
    req.store = store
    next()
  } catch (err) {
    console.error("Service Key verification error:", err)
    res.status(500).json({ error: err.message || "Internal server error during service key verification" })
  }
}

module.exports = serviceKeyMiddleware
