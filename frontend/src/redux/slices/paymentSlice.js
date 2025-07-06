import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchPayments = createAsyncThunk(
  "payment/fetchPayments",
  async ({ admin = false, page = 1, limit = 10, headers = {} }, { rejectWithValue }) => {
    try {
      const endpoint = admin ? "/payments" : "/payments/transactions";
      const response = await api.get(`${endpoint}?page=${page}&limit=${limit}`, { headers });
      return { data: response.data, isAdmin: admin };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const addPaymentMethod = createAsyncThunk(
  "payment/addPaymentMethod",
  async (data, { getState, rejectWithValue }) => {
    try {
      const { payment } = getState();
      const headers = payment.headers || {};
      const response = await api.post("/payments/method", data, { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const uploadEvidence = createAsyncThunk(
  "payment/uploadEvidence",
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { payment } = getState();
      const headers = { ...payment.headers, "Content-Type": "multipart/form-data" };
      const response = await api.post("/payments/evidence", formData, { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const confirmPayment = createAsyncThunk(
  "payment/confirmPayment",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { payment } = getState();
      const headers = payment.headers || {};
      const response = await api.put(`/payments/confirm/${id}`, {}, { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const rejectPayment = createAsyncThunk(
  "payment/rejectPayment",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { payment } = getState();
      const headers = payment.headers || {};
      const response = await api.put(`/payments/reject/${id}`, {}, { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const issueRefund = createAsyncThunk(
  "payment/issueRefund",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { payment } = getState();
      const headers = payment.headers || {};
      const response = await api.post(`/payments/refund/${id}`, {}, { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getTransactionReport = createAsyncThunk(
  "payment/getTransactionReport",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { payment } = getState();
      const headers = payment.headers || {};
      const response = await api.get("/payments/report", { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const createRefundRequest = createAsyncThunk(
  "payment/createRefundRequest",
  async ({ transactionId, reason, headers = {} }, { rejectWithValue }) => {
    try {
      const response = await api.post("/payments/refund-request", { transactionId, reason }, { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getRefundRequests = createAsyncThunk(
  "payment/getRefundRequests",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { payment } = getState();
      const headers = payment.headers || {};
      const response = await api.get("/payments/refund-requests", { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const handleRefundRequest = createAsyncThunk(
  "payment/handleRefundRequest",
  async ({ requestId, action }, { getState, rejectWithValue }) => {
    try {
      const { payment } = getState();
      const headers = payment.headers || {};
      const response = await api.post("/payments/handle-refund-request", { requestId, action }, { headers });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payments: [],
    transactions: [],
    refundRequests: [],
    total: 0,
    page: 1,
    pages: 1,
    report: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload.isAdmin) {
          state.payments = action.payload.data.payments || action.payload.data;
        } else {
          state.transactions = action.payload.data.transactions || action.payload.data;
        }
        if (action.payload.data.total) {
          state.total = action.payload.data.total;
          state.page = action.payload.data.page;
          state.pages = action.payload.data.pages;
        }
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message || "Failed to fetch payments";
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.payments.push(action.payload);
      })
      .addCase(uploadEvidence.fulfilled, (state, action) => {
        const payment = state.payments.find((p) => p._id === action.meta.arg.get("paymentId"));
        if (payment) payment.evidence = action.payload.payment.evidence;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p._id === action.meta.arg);
        if (index !== -1) state.payments[index].status = "confirmed";
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p._id === action.meta.arg);
        if (index !== -1) state.payments[index].status = "rejected";
      })
      .addCase(issueRefund.pending, (state) => {
        state.status = "loading";
      })
      .addCase(issueRefund.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.transactions.findIndex((t) => t._id === action.meta.arg);
        if (index !== -1) {
          state.transactions[index].status = "refunded";
        }
      })
      .addCase(issueRefund.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message || "Failed to issue refund";
      })
      .addCase(getTransactionReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTransactionReport.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.report = action.payload;
      })
      .addCase(getTransactionReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message || "Failed to fetch report";
      })
      .addCase(createRefundRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createRefundRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(createRefundRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message || "Failed to submit refund request";
      })
      .addCase(getRefundRequests.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getRefundRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.refundRequests = action.payload;
      })
      .addCase(getRefundRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message || "Failed to fetch refund requests";
      })
      .addCase(handleRefundRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(handleRefundRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.refundRequests.findIndex((r) => r._id === action.meta.arg.requestId);
        if (index !== -1) {
          state.refundRequests[index].status = action.payload.refundRequest.status;
        }
        const transactionIndex = state.transactions.findIndex(
          (t) => t._id === action.payload.refundRequest.transactionId
        );
        if (transactionIndex !== -1 && action.payload.refundRequest.status === "approved") {
          state.transactions[transactionIndex].status = "refunded";
        }
      })
      .addCase(handleRefundRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message || "Failed to handle refund request";
      });
  },
});

export const { clearError } = paymentSlice.actions;

export default paymentSlice.reducer;