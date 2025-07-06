import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  checkoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout" },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  type: {
    type: String,
    enum: ["payment", "refund"],
    default: "payment",
  },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
export default Transaction;