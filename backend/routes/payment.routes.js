import express from "express";
import fs from "fs";
import multer from "multer";
import {
  addPaymentMethod,
  confirmPayment,
  createRefundRequest,
  deleteRefundRequest,
  getAllPayments,
  getRefundRequests,
  getTransactionReport,
  getTransactions,
  handleRefundRequest,
  issueRefund,
  myTransactions,
  rejectPayment,
  uploadEvidence,
} from "../controllers/payment.controller.js";
import { authMiddleware, protect } from "../middleware/auth.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "Uploads/payments";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
    }
  },
});

const paymentRouter = express.Router();
paymentRouter.post("/method", protect, addPaymentMethod);
paymentRouter.post("/evidence", protect, upload.single("evidence"), uploadEvidence);
paymentRouter.get("/transactions", protect, getTransactions);
paymentRouter.get("/my-transactions",authMiddleware, myTransactions);
paymentRouter.get("/all-payments", protect, getAllPayments);
paymentRouter.put("/confirm/:id", protect, confirmPayment);
paymentRouter.put("/reject/:id", protect, rejectPayment);
paymentRouter.post("/refund/:id", protect, issueRefund);
paymentRouter.get("/report", protect, getTransactionReport);
paymentRouter.post("/refund-request", createRefundRequest);
paymentRouter.get("/refund-requests", protect, getRefundRequests);
paymentRouter.post("/handle-refund-request", protect, handleRefundRequest);
paymentRouter.delete("/refund-request/:id", protect, deleteRefundRequest);

export default paymentRouter;