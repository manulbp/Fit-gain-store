import fs from "fs";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import { Checkout } from "../models/checkout.model.js";
import Payment from "../models/payment.model.js";
import RefundRequest from "../models/refundRequest.model.js";
import Transaction from "../models/transaction.model.js";

export const addPaymentMethod = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accountNumber, amount, checkoutId } = req.body;
    const userId = req.user._id;

    const payment = new Payment({
      userId,
      accountNumber,
      amount,
      checkoutId,
    });
    await payment.save({ session });

    const transaction = new Transaction({
      paymentId: payment._id,
      userId,
      amount,
      checkoutId,
      status: 'completed',
    });
    await transaction.save({ session });

    if (transaction.status === 'completed') {
      const checkout = await Checkout.findById(checkoutId)
        .session(session)
        .lean();

      if (!checkout) {
        throw new Error('Checkout not found');
      }

      for (const item of checkout.items) {
        await Cart.deleteOne(
          { user: userId, product: item.product },
          { session }
        );
      }
    }

    await session.commitTransaction();
    res.status(201).json(payment);
  } catch (error) {
    await session.abortTransaction();
    console.log('Error occurred:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

export const uploadEvidence = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No evidence file provided" });
    }

    const paymentId = req.body.paymentId;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.evidence) {
      fs.unlinkSync(payment.evidence);
    }

    payment.evidence = req.file.path;
    await payment.save();

    res.json({ message: "Evidence uploaded successfully", payment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const myTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(limit)
      .populate("paymentId");

    res.json({
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = req.user.isAdmin ? {} : { userId: req.user._id };
    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(limit)
      .populate("paymentId");

    res.json({
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "confirmed";
    await payment.save();

    const transaction = await Transaction.findOne({ paymentId: payment._id });
    transaction.status = "completed";
    await transaction.save();

    res.json({ message: "Payment confirmed", payment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "rejected";
    await payment.save();

    const transaction = await Transaction.findOne({ paymentId: payment._id });
    transaction.status = "failed";
    await transaction.save();

    res.json({ message: "Payment rejected", payment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const issueRefund = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment || payment.status !== "confirmed") {
      return res.status(400).json({ message: "Cannot refund unconfirmed payment" });
    }

    const refundTransaction = new Transaction({
      paymentId: payment._id,
      userId: payment.userId,
      amount: payment.amount,
      status: "refunded",
      type: "refund",
    });
    await refundTransaction.save();

    const originalTransaction = await Transaction.findOne({ paymentId: payment._id, type: "payment" });
    originalTransaction.status = "refunded";
    await originalTransaction.save();

    res.json({ message: "Refund issued", refundTransaction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getTransactionReport = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const transactions = await Transaction.find().populate("paymentId");

    const report = {
      totalPayments: transactions.filter((t) => t.type === "payment").length,
      totalRefunds: transactions.filter((t) => t.type === "refund").length,
      totalAmount: transactions.reduce((sum, t) => sum + (t.type === "payment" ? t.amount : -t.amount), 0),
      pending: transactions.filter((t) => t.status === "pending").length,
      completed: transactions.filter((t) => t.status === "completed").length,
      failed: transactions.filter((t) => t.status === "failed").length,
      refunded: transactions.filter((t) => t.status === "refunded").length,
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .skip(skip)
      .limit(limit);

    res.json({
      payments,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllPaymentsWithTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        select: '_id email',
      })
      .populate({
        path: 'checkoutId',
        select: '_id items',
      })
      .lean();

    const paymentIds = payments.map((payment) => payment._id);
    const transactions = await Transaction.find({ paymentId: { $in: paymentIds } }).lean();

    const enrichedPayments = payments.map((payment) => ({
      ...payment,
      transaction: transactions.find((t) => t.paymentId.toString() === payment._id.toString()) || null,
    }));

    res.json({
      payments: enrichedPayments,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createRefundRequest = async (req, res) => {
  try {
    const { transactionId, reason, userId } = req.body;
    const transaction = await Transaction.findById(transactionId).populate("paymentId");
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (transaction.status !== "completed") {
      return res.status(400).json({ message: "Can only request refunds for completed transactions" });
    }
    const existingRequest = await RefundRequest.findOne({ transactionId, status: "pending" });
    if (existingRequest) {
      return res.status(400).json({ message: "A pending refund request already exists for this transaction" });
    }

    const refundRequest = new RefundRequest({
      transactionId,
      userId,
      reason,
    });
    await refundRequest.save();
    res.status(201).json({ message: "Refund request submitted successfully", refundRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getRefundRequests = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const refundRequests = await RefundRequest.find()
      .populate({
        path: "transactionId",
        populate: { path: "paymentId" },
      })
      .populate({
        path: "userId",
        select: "name email",
      })
      .lean();
    res.json(refundRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteRefundRequest = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const refundRequest = await RefundRequest.findById(req.params.id);
    if (!refundRequest) {
      return res.status(404).json({ message: "Refund request not found" });
    }

    if (refundRequest.status !== "pending") {
      return res.status(400).json({ message: "Can only delete pending refund requests" });
    }

    await RefundRequest.deleteOne({ _id: req.params.id });
    console.log("Refund request deleted successfully")
    res.json({ message: "Refund request deleted successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const handleRefundRequest = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { requestId, action } = req.body;
    const refundRequest = await RefundRequest.findById(requestId);
    if (!refundRequest) {
      return res.status(404).json({ message: "Refund request not found" });
    }
    if (refundRequest.status !== "pending") {
      return res.status(400).json({ message: "Refund request has already been processed" });
    }

    refundRequest.status = action === "approve" ? "approved" : "rejected";
    await refundRequest.save();

    if (action === "approve") {
      const transaction = await Transaction.findById(refundRequest.transactionId).populate("paymentId");
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      const payment = transaction.paymentId;
      if (payment.status !== "confirmed" && payment.status !== "pending") {
        return res.status(400).json({
          message: `Cannot refund a payment with status "${payment.status}". Only "confirmed" or "pending" payments can be refunded.`,
        });
      }

      const refundTransaction = new Transaction({
        paymentId: payment._id,
        userId: payment.userId,
        amount: payment.amount,
        status: "refunded",
        type: "refund",
      });
      await refundTransaction.save();

      transaction.status = "refunded";
      await transaction.save();
    }

    res.json({ message: `Refund request ${action} successfully`, refundRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};