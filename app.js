require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors") 
const authRoutes = require("./routes/authRoutes")
const storeRoutes = require("./routes/storeRoutes")
const statusRoutes = require("./routes/statusRoutes") // Import new status routes
const { connectMainDB } = require("./config/db") // Destructure connectMainDB


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

connectMainDB()

app.use("/api/auth", authRoutes)
app.use("/api/store", storeRoutes)
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
