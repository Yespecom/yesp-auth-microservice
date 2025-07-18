// models/TenantStore.js
const mongoose = require("mongoose")

const tenantStoreSchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true },
    storeId: { type: String, unique: true, required: true },
    tenantId: { type: String, required: true },
    category: { type: String, required: false },
    gstNumber: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "stores" }, // This ensures the collection is named 'stores'
)

module.exports = tenantStoreSchema