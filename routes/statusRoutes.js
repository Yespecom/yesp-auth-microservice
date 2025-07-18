const express = require("express")
const router = express.Router()
const { mainDbConnection } = require("../config/db") // Import the connection object

router.get("/db", (req, res) => {
  const dbState = mainDbConnection.readyState

  // Mongoose connection states:
  // 0 = disconnected
  // 1 = connected
  // 2 = connecting
  // 3 = disconnecting
  // 99 = uninitialized

  let statusMessage = "Unknown"
  let statusCode = 500

  switch (dbState) {
    case 0:
      statusMessage = "Disconnected"
      statusCode = 503 // Service Unavailable
      break
    case 1:
      statusMessage = "Connected"
      statusCode = 200 // OK
      break
    case 2:
      statusMessage = "Connecting"
      statusCode = 200 // OK (but still in progress)
      break
    case 3:
      statusMessage = "Disconnecting"
      statusCode = 503 // Service Unavailable
      break
    case 99:
      statusMessage = "Uninitialized"
      statusCode = 500 // Internal Server Error
      break
    default:
      statusMessage = "Unknown state"
      statusCode = 500
  }

  res.status(statusCode).json({
    status: statusMessage,
    readyState: dbState,
    message: `Main database is currently ${statusMessage.toLowerCase()}.`,
  })
})

module.exports = router
