const mongoose = require("mongoose")

const MAIN_DB_NAME = "yesp_main_db" // Define main DB name

// Main DB connection
const connectMainDB = async () => {
  try {
    await mongoose.connect(`${process.env.MAIN_DB_URI}${MAIN_DB_NAME}`)
    console.log("✅ Connected to Main DB")
  } catch (error) {
    console.error("❌ Error connecting to Main DB:", error.message)
    process.exit(1) // Exit process with failure
  }
}

// Function to connect to a specific tenant database
const tenantConnections = {} // Cache for tenant connections

const connectTenantDB = async (dbName) => {
  if (tenantConnections[dbName] && tenantConnections[dbName].readyState === 1) {
    console.log(`✅ Reusing connection for Tenant DB: ${dbName}`)
    return tenantConnections[dbName]
  }

  try {
    const tenantDbUri = `${process.env.MAIN_DB_URI}${dbName}`
    const tenantConnection = await mongoose.createConnection(tenantDbUri)

    tenantConnection.on("connected", () => {
      console.log(`✅ Connected to Tenant DB: ${dbName}`)
    })
    tenantConnection.on("error", (err) => {
      console.error(`❌ Error connecting to Tenant DB ${dbName}:`, err.message)
    })
    tenantConnection.on("disconnected", () => {
      console.warn(`⚠️ Disconnected from Tenant DB: ${dbName}`)
      delete tenantConnections[dbName] // Remove from cache on disconnect
    })

    tenantConnections[dbName] = tenantConnection
    return tenantConnection
  } catch (error) {
    console.error(`❌ Failed to create connection for Tenant DB ${dbName}:`, error.message)
    throw error
  }
}

// Export the mongoose connection object for the main DB
const mainDbConnection = mongoose.connection

module.exports = { connectMainDB, mainDbConnection, connectTenantDB }
