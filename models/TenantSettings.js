const mongoose = require("mongoose")

// This schema is for a model that would exist within a tenant's specific database
const tenantSettingsSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  welcomeMessage: { type: String, default: "Welcome to your new tenant space!" },
  defaultCurrency: { type: String, default: "USD" },
  createdAt: { type: Date, default: Date.now },
})

// We don't export a direct model here, but rather the schema.
// The model will be created on a specific tenant connection.
module.exports = tenantSettingsSchema
