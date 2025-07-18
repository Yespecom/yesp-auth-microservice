const mongoose = require("mongoose")

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  storeId: { type: String, unique: true, required: true },
  tenantId: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  secretApiKey: { type: String, required: true },
  category: { type: String, required: false }, // New: Store category (e.g., "Retail", "Food", "Service")
  gstNumber: { type: String, required: false }, // New: GST (Goods and Services Tax) number, optional
  createdAt: { type: Date, default: Date.now }, // Already present, explicitly showing default
})

module.exports = mongoose.model("Store", storeSchema)
