import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { UserContext } from "../context/UserContext";
import axios from "axios";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
}));

const TransactionHistory = () => {
  const { User, authToken } = useContext(UserContext);
  const userId = User.user?.id;
  const isUser = !!User.user && !User.admin;

  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [reason, setReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (userId && authToken && isUser) {
        setStatus("loading");
        try {
          const response = await axios.get("http://localhost:4000/api/payments/my-transactions", {
            headers: {
              token: authToken,
            },
            params: {
              page: 1,
              limit: 10,
            },
          });
          setTransactions(response.data.transactions || []);
          setStatus("succeeded");
        } catch (err) {
          setError(err.response?.data?.message || err.message || "Failed to fetch transactions");
          setStatus("failed");
        }
      }
    };

    fetchTransactions();
  }, [userId, authToken, isUser]);

  useEffect(() => {
    if (error || errors || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setErrors(null);
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, errors, successMessage]);

  const handleOpen = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTransaction(null);
    setReason("");
  };

  const handleRequestRefund = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the refund request.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4000/api/payments/refund-request",
        { transactionId: selectedTransaction._id, reason, userId },
        {
          headers: {
            "user-id": userId,
            "is-user": "true",
            token: authToken,
          },
        }
      );
      setSuccessMessage(response.data.message || "Refund request submitted successfully!");
      handleClose();
    } catch (err) {
      console.error("Refund request failed:", err);
      setErrors(err.response?.data?.message || err.message || "Failed to submit refund request");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
        Transaction History
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {errors && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors(null)}>
          {errors}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      {!isUser && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This page is for users only. Admins cannot request refunds.
        </Alert>
      )}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Evidence</StyledTableCell>
              <StyledTableCell>Refund Request</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {status === "loading" ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !transactions || transactions.length === 0 ? (
              <TableRow >
                <TableCell colSpan={6} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction._id}
                  sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                  <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>Rs {transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>
                    {transaction.paymentId?.evidence ? (
                      <Button
                        variant="outlined"
                        size="small"
                        href={`http://localhost:4000/${transaction.paymentId.evidence}`}
                        target="_blank"
                        sx={{ textTransform: "none" }}
                      >
                        View
                      </Button>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {isUser && transaction.status === "completed" && transaction.type === "payment" ? (
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleOpen(transaction)}
                      >
                        Request Refund
                      </Button>
                    ) : transaction.status === "refunded" && transaction.type === "payment" ? (
                      <Chip label="Payment - Refunded" color="warning" size="small" />
                    ) : transaction.status === "refunded" ? (
                      <Chip label="Refunded" color="success" size="small" />
                    ) : transaction.status === "failed" ? (
                      <Chip label="Failed" color="error" size="small" />
                    ) : (
                      "N/A"
                    )}
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Request Refund</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Transaction ID: {selectedTransaction?._id?.slice(-6)}</Typography>
          <Typography gutterBottom>Amount: Rs {selectedTransaction?.amount?.toFixed(2)}</Typography>
          <TextField
            label="Reason for Refund"
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleRequestRefund} color="primary" variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionHistory;