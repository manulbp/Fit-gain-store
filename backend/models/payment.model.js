import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  checkoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout", required: true },
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  evidence: { type: String },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;