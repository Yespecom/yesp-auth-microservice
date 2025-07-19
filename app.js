require("dotenv").config()
const express = require("express")
const app = express()
const authRoutes = require("./routes/authRoutes")
const storeRoutes = require("./routes/storeRoutes")
const statusRoutes = require("./routes/statusRoutes") // Import new status routes
const { connectMainDB } = require("./config/db") // Destructure connectMainDB
const cors = require("cors")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Manual CORS headers for preflight handling
app.use((req, res, next) => {
  const allowedOrigins = ["https://ecom.yespstudio.com", "http://localhost:3000", "http://localhost:3001"]

  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
  res.setHeader("Access-Control-Allow-Credentials", "true")

  // Handle preflight requests immediately
  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  next()
})

// CORS middleware as backup
const corsOptions = {
  origin: ["https://ecom.yespstudio.com", "http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
}

app.use(cors(corsOptions))

connectMainDB()

app.use("/api/auth", authRoutes)
app.use("/api/store", storeRoutes)
app.use("/api/dashboard", storeRoutes)
app.use("/api/status", statusRoutes) // Use new status routes

// Basic route for health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "YESP Auth Service is running!" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

module.exports = app
