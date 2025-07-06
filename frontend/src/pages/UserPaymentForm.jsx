import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Typography, TextField, Button, Paper, Input } from "@mui/material";
import { styled } from "@mui/material/styles";
import { addPaymentMethod, uploadEvidence } from "../redux/slices/paymentSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[4],
  backgroundColor: "#fff",
}));

const UserPaymentForm = () => {
  const { fetchCartItems } = useContext(CartContext)
  const dispatch = useDispatch();
  const location = useLocation();
  const { checkoutId, total } = location.state || {};
  const [accountNumber, setAccountNumber] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [accountNumberError, setAccountNumberError] = useState("");
  const [evidenceError, setEvidenceError] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const validateAccountNumber = (number) => {
    if (!number) {
      setAccountNumberError("Account number is required");
      return false;
    }
    if (!/^\d{8,17}$/.test(number)) {
      setAccountNumberError("Account number must be 8-17 digits");
      return false;
    }
    setAccountNumberError("");
    return true;
  };

  const validateEvidence = (file) => {
    if (!file) {
      setEvidenceError("Evidence file is required");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEvidenceError("File size must be less than 5MB");
      return false;
    }
    const acceptedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!acceptedTypes.includes(file.type)) {
      setEvidenceError("Only JPEG, PNG, and PDF files are allowed");
      return false;
    }
    setEvidenceError("");
    return true;
  };

  const handleSubmit = async () => {
    const isAccountValid = validateAccountNumber(accountNumber);
    const isEvidenceValid = validateEvidence(evidence);

    if (!isAccountValid || !isEvidenceValid || !checkoutId || !total) {
      alert("Please provide valid payment details and ensure checkout is valid.");
      return;
    }

    try {
      const paymentResponse = await dispatch(
        addPaymentMethod({ accountNumber, amount: total, checkoutId }, { headers: { "user-id": user.id, "Content-Type": "application/json" } })
      ).unwrap();

      if (evidence) {
        const formData = new FormData();
        formData.append("evidence", evidence);
        formData.append("paymentId", paymentResponse._id);

        await dispatch(
          uploadEvidence(formData, { headers: { "user-id": user.id, "Content-Type": "multipart/form-data" } })
        ).unwrap();
      }

      alert("Payment submitted successfully!");
      setAccountNumber("");
      setEvidence(null);
      fetchCartItems();
      navigate("/checkout");
    } catch (error) {
      alert("Error submitting payment: " + (error.message || "Unknown error"));
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
        Submit Payment
      </Typography>
      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          Total to Pay: Rs {total?.toFixed(2) || "0.00"}
        </Typography>
        <TextField
          label="Bank Account Number"
          variant="outlined"
          fullWidth
          value={accountNumber}
          onChange={(e) => {
            setAccountNumber(e.target.value);
            if (accountNumberError) validateAccountNumber(e.target.value);
          }}
          error={!!accountNumberError}
          helperText={accountNumberError}
          sx={{ mb: 2 }}
          placeholder="Enter your account number (8-17 digits)"
          inputProps={{ maxLength: 17 }}
        />
        <Input
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            setEvidence(file);
            if (file) validateEvidence(file);
          }}
          inputProps={{ accept: "image/jpeg,image/png,application/pdf" }}
          sx={{ mb: 2, display: "block" }}
        />
        {evidenceError && (
          <Typography variant="caption" color="error" sx={{ mb: 1, display: "block" }}>
            {evidenceError}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload payment evidence (JPEG, PNG, PDF only, max 5MB)
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          sx={{ borderRadius: 20, textTransform: "none", px: 4 }}
        >
          Submit Payment
        </Button>
      </StyledPaper>
    </Box>
  );
};

export default UserPaymentForm;