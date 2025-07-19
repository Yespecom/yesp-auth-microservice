require("dotenv").config()
const express = require("express")
const app = express()
const authRoutes = require("./routes/authRoutes")
const storeRoutes = require("./routes/storeRoutes")
const statusRoutes = require("./routes/statusRoutes")
const { connectMainDB } = require("./config/db")
const cors = require("cors")

// ✅ Clean CORS setup
const allowedOrigins = [
  "https://ecom.yespstudio.com",
  "http://localhost:3000",
  "http://localhost:3001",
]

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
}

app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

connectMainDB()

app.use("/api/auth", authRoutes)
app.use("/api/store", storeRoutes)
app.use("/api/dashboard", storeRoutes)
app.use("/api/status", statusRoutes)

app.get("/", (req, res) => {
  res.status(200).json({ message: "YESP Auth Service is running!" })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

module.exports = app
