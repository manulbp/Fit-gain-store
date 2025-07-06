import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
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

const statusColors = {
  completed: "success",
  pending: "warning",
  failed: "error",
  refunded: "info",
  approved: "success",
  rejected: "error",
};

const AdminRefundPanel = () => {
  const { User, authToken } = useContext(UserContext);
  const isAdmin = User.admin?.role === "admin";
  const userId = User.admin?.id;

  const [refundRequests, setRefundRequests] = useState([]);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const headers = {
    "user-id": userId,
    "is-admin": "true",
    token: authToken,
  };

  useEffect(() => {
    if (isAdmin && userId && authToken) {
      const fetchData = async () => {
        setStatus("loading");
        try {
          const reportResponse = await axios.get("http://localhost:4000/api/payments/report", { headers });
          setReport(reportResponse.data);

          const refundRequestsResponse = await axios.get("http://localhost:4000/api/payments/refund-requests", {
            headers,
          });
          setRefundRequests(refundRequestsResponse.data || []);

          setStatus("succeeded");
        } catch (err) {
          setError(err.response?.data?.message || err.message || "Failed to load data");
          setStatus("failed");
        }
      };
      fetchData();
    }
  }, [isAdmin, userId, authToken]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleRefundRequestAction = async (requestId, action) => {
    if (window.confirm(`Are you sure you want to ${action} this refund request?`)) {
      try {
        await axios.post(
          "http://localhost:4000/api/payments/handle-refund-request",
          { requestId, action },
          { headers }
        );
        const reportResponse = await axios.get("http://localhost:4000/api/payments/report", { headers });
        setReport(reportResponse.data);
        const refundRequestsResponse = await axios.get("http://localhost:4000/api/payments/refund-requests", {
          headers,
        });
        setRefundRequests(refundRequestsResponse.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || `Failed to ${action} refund request`);
      }
    }
  };

  const handleDeleteRefundRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to delete this refund request?")) {
      try {
        await axios.delete(`http://localhost:4000/api/payments/refund-request/${requestId}`, { headers });
        const refundRequestsResponse = await axios.get("http://localhost:4000/api/payments/refund-requests", {
          headers,
        });
        setRefundRequests(refundRequestsResponse.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to delete refund request");
      }
    }
  };

  const generateAllRefundsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("All Refunds Report", 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [["Request ID", "Transaction ID", "Payment ID", "User Name", "Amount", "Reason", "Status", "Date"]],
      body: refundRequests.map((request) => [
        request._id.slice(-6),
        request.transactionId?._id?.slice(-6) || "N/A",
        request.transactionId?.paymentId?._id?.slice(-6) || "N/A",
        request.userId?.name || request.userId?.email || "N/A",
        request.transactionId?.amount ? `Rs ${request.transactionId.amount.toFixed(2)}` : "N/A",
        request.reason || "N/A",
        request.status || "N/A",
        request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A",
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
    doc.save("All_Refunds_Report.pdf");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Admin Refund & Reports
        </Typography>
        {isAdmin && (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<FaFilePdf />}
            onClick={generateAllRefundsPDF}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "0.8rem",
              px: 2,
              py: 0.5,
            }}
          >
            Export All Refunds as PDF
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!isAdmin && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Access restricted to admin users only.
        </Alert>
      )}

      {isAdmin && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Transaction Summary Report
          </Typography>

          {status === "loading" && !report ? (
            <CircularProgress />
          ) : report ? (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 2 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Total Payments</Typography>
                <Typography variant="h4">{report.totalPayments}</Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Total Refunds</Typography>
                <Typography variant="h4">{report.totalRefunds}</Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Total Amount</Typography>
                <Typography variant="h4">Rs {report.totalAmount?.toFixed(2)}</Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Pending</Typography>
                <Typography variant="h4">{report.pending}</Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Completed</Typography>
                <Typography variant="h4">{report.completed}</Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Failed</Typography>
                <Typography variant="h4">{report.failed}</Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Refunded</Typography>
                <Typography variant="h4">{report.refunded}</Typography>
              </Paper>
            </Box>
          ) : (
            <Typography>No report data available</Typography>
          )}
        </Paper>
      )}

      {isAdmin && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Refund Requests
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Request ID</StyledTableCell>
                  <StyledTableCell>Transaction ID</StyledTableCell>
                  <StyledTableCell>Payment ID</StyledTableCell>
                  <StyledTableCell>User Name</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                  <StyledTableCell>Reason</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {status === "loading" && refundRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : refundRequests.filter(request => request.status === "pending").length > 0 ? (
                  refundRequests
                    .filter(request => request.status === "pending")
                    .map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>{request._id.slice(-6)}</TableCell>
                        <TableCell>{request.transactionId?._id?.slice(-6) || "N/A"}</TableCell>
                        <TableCell>{request.transactionId?.paymentId?._id?.slice(-6) || "N/A"}</TableCell>
                        <TableCell>{request.userId?.name || request.userId?.email || "N/A"}</TableCell>
                        <TableCell>Rs {request.transactionId?.amount?.toFixed(2) || "N/A"}</TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>
                          <Chip label={request.status} color={statusColors[request.status] || "default"} />
                        </TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {request.status === "pending" && (
                            <>
                              <Button
                                variant="outlined"
                                color="success"
                                onClick={() => handleRefundRequestAction(request._id, "approve")}
                                disabled={status === "loading"}
                                sx={{ mr: 1 }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleRefundRequestAction(request._id, "reject")}
                                disabled={status === "loading"}
                                sx={{ mr: 1 }}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteRefundRequest(request._id)}
                                disabled={status === "loading"}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No pending refund requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {isAdmin && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Refund Management
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Request ID</StyledTableCell>
                  <StyledTableCell>Transaction ID</StyledTableCell>
                  <StyledTableCell>Payment ID</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell hidden>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {status === "loading" && refundRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : refundRequests?.length > 0 ? (
                  refundRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{request._id.slice(-6)}</TableCell>
                      <TableCell>{request.transactionId?._id?.slice(-6) || "N/A"}</TableCell>
                      <TableCell>{request.transactionId?.paymentId?._id?.slice(-6) || "N/A"}</TableCell>
                      <TableCell>Rs {request.transactionId?.amount?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell>
                        <Chip label={request.status} color={statusColors[request.status] || "default"} />
                      </TableCell>
                      <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell hidden>
                        {request.status != "pending" && (
                        // {request.status === "pending" && (
                          <>
                            <Button
                              variant="outlined"
                              color="success"
                              onClick={() => handleRefundRequestAction(request._id, "approve")}
                              disabled={status === "loading"}
                              sx={{ mr: 1 }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleRefundRequestAction(request._id, "reject")}
                              disabled={status === "loading"}
                              sx={{ mr: 1 }}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteRefundRequest(request._id)}
                              disabled={status === "loading"}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No refund requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default AdminRefundPanel;