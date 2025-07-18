const mongoose = require("mongoose")

const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, unique: true, required: true },
  dbName: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Tenant", tenantSchema)
