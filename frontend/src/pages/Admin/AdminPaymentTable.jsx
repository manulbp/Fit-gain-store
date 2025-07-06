import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
}));

const AdminPaymentTable = () => {
  const { User, authToken } = useContext(UserContext);
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("idle");
  const [search, setSearch] = useState("");
  const isAdmin = User.admin?.role === "admin";
  const userId = User.admin?.id || User.user?.id;

  useEffect(() => {
    if (isAdmin && authToken) {
      setStatus("loading");
      axios
        .get("http://localhost:4000/api/payments/all-payments", {
          headers: {
            "user-id": userId,
            "is-admin": "true",
            token: authToken,
          },
        })
        .then((response) => {
          setPayments(response.data.payments);
          setStatus("succeeded");
        })
        .catch((error) => {
          console.error("Error fetching payments:", error);
          setStatus("failed");
        });
    }
  }, [isAdmin, userId, authToken]);

  const filteredPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        (payment.userId || "").toString().toLowerCase().includes(search.toLowerCase()) ||
        (payment.accountNumber || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search]);

  const handleConfirm = useCallback(
    async (paymentId) => {
      if (!isAdmin || !authToken) return;
      try {
        await axios.put(
          `http://localhost:4000/api/payments/confirm/${paymentId}`,
          {},
          {
            headers: {
              "user-id": userId,
              "is-admin": "true",
              token: authToken,
            },
          }
        );
        alert("Payment confirmed");
        setPayments((prev) =>
          prev.map((p) =>
            p._id === paymentId
              ? { ...p, status: "confirmed", transaction: { ...p.transaction, status: "completed" } }
              : p
          )
        );
      } catch (error) {
        alert("Error: " + (error.response?.data?.message || error.message));
      }
    },
    [isAdmin, userId, authToken]
  );

  const handleReject = useCallback(
    async (paymentId) => {
      if (!isAdmin || !authToken) return;
      try {
        await axios.put(
          `http://localhost:4000/api/payments/reject/${paymentId}`,
          {},
          {
            headers: {
              "user-id": userId,
              "is-admin": "true",
              token: authToken,
            },
          }
        );
        alert("Payment rejected");
        setPayments((prev) =>
          prev.map((p) =>
            p._id === paymentId
              ? { ...p, status: "rejected", transaction: { ...p.transaction, status: "failed" } }
              : p
          )
        );
      } catch (error) {
        alert("Error: " + (error.response?.data?.message || error.message));
      }
    },
    [isAdmin, userId, authToken]
  );

  const generateAllPaymentsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("All Payments Report", 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [["User ID", "Account Number", "Amount", "Status", "Date"]],
      body: payments.map((payment) => [
        payment.userId?._id || "N/A",
        payment.accountNumber || "N/A",
        payment.amount ? `Rs ${payment.amount.toFixed(2)}` : "N/A",
        payment.status || "N/A",
        payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [210, 105, 30],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);
    doc.save("All_Payments_Report.pdf");
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Payment Management
        </Typography>
        {isAdmin && (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<FaFilePdf />}
            onClick={generateAllPaymentsPDF}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "0.8rem",
              px: 2,
              py: 0.5,
            }}
          >
            Export All Payments as PDF
          </Button>
        )}
      </Box>
      <TextField
        label="Search by User ID or Account Number"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>User ID</StyledTableCell>
              <StyledTableCell>Account Number</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Evidence</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {status === "loading" ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment._id} sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                  <TableCell>{payment.userId || 'N/A'}</TableCell>
                  <TableCell>{payment.accountNumber || 'N/A'}</TableCell>
                  <TableCell>Rs {payment.amount ? payment.amount.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell>{payment.status || 'N/A'}</TableCell>
                  <TableCell>
                    {payment.evidence ? (
                      <Button
                        variant="outlined"
                        size="small"
                        href={`http://localhost:4000/${payment.evidence}`}
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
                    {payment.status === "pending" && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleConfirm(payment._id)}
                          sx={{ mr: 1, borderRadius: 20, textTransform: "none" }}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleReject(payment._id)}
                          sx={{ borderRadius: 20, textTransform: "none" }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminPaymentTable;