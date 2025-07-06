import mongoose from "mongoose";

const refundRequestSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const RefundRequest = mongoose.models.RefundRequest || mongoose.model("RefundRequest", refundRequestSchema);
export default RefundRequest;