import React, { useState, useEffect, useContext } from "react";
import { Box, Button, Grid, TextField, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const provinceDistricts = {
  Western: ["Colombo", "Gampaha", "Kalutara"],
  Southern: ["Galle", "Matara", "Hambantota"],
  "North-Western": ["Kurunegala", "Puttalam"],
  Central: ["Kandy", "Matale", "Nuwara Eliya"],
  Sabaragamuva: ["Kegalle", "Ratnapura"],
  Northern: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  Eastern: ["Ampara", "Batticaloa", "Trincomalee"],
  Uva: ["Badulla", "Monaragala"],
  "North-Central": ["Anuradhapura", "Polonnaruwa"],
};

const AddCheckout = () => {
  const { User, authToken } = useContext(UserContext);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [mobile, setMobile] = useState("");
  const [errorMessage, setErrorMessage] = useState({});
  const [districts, setDistricts] = useState([]);
  const location = useLocation();
  const totalFromCart = parseFloat(location.state?.total || 0);
  const itemsFromCart = location.state?.items || [];
  const userMail = User.user?.email || User.admin?.email || "";
  const userId = User.user?.id || User.admin?.id || "";
  const deliveryFee = 300;
  const totalWithDelivery = totalFromCart + deliveryFee;
  const navigate = useNavigate();

  useEffect(() => {
    if (state && provinceDistricts[state]) {
      setDistricts(provinceDistricts[state]);
      setDistrict("");
    } else {
      setDistricts([]);
      setDistrict("");
    }
  }, [state]);

  const validationSchema = Yup.object({
    fname: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("First name is required"),
    lname: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Last name is required"),
    street: Yup.string().required("Street address is required"),
    city: Yup.string().required("City is required"),
    district: Yup.string().required("District is required"),
    state: Yup.string().required("State is required"),
    zipcode: Yup.string().matches(/^\d{5}$/, "Zip Code must be exactly 5 digits").required("Zip Code is required"),
    mobile: Yup.string().matches(/^0\d{9}$/, "Invalid Mobile Number").required("Mobile Number is required"),
  });

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!authToken || !userId) {
      navigate("/login");
      return;
    }
    if (!itemsFromCart.length) {
      alert("No items selected for checkout");
      return;
    }
    try {
      await validationSchema.validate({ fname, lname, street, city, district, state, zipcode, mobile }, { abortEarly: false });
      const items = itemsFromCart.map((item) => ({
        product: item._id,
        productname: item.productName,
        quantity: item.quantity,
        price: item.price,
      }));
      const response = await axios.post(
        "http://localhost:4000/api/checkout/add",
        { fname, lname, street, city, district, state, zipcode, total: totalWithDelivery, mobile, userMail, userId, items },
        { headers: { token: authToken } }
      );
      navigate("/payment", { state: { checkoutId: response.data.data._id, total: response.data.data.total, items:response.data.data.items } });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setErrorMessage(errors);
      } else {
        alert(error.response?.data?.message || "Failed to process checkout");
      }
    }
  };

  return (
    <Box sx={{ maxWidth: "1100px", margin: "auto", padding: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Delivery Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name" variant="outlined" value={fname} onChange={(e) => setFname(e.target.value)} />
                {errorMessage.fname && <Typography color="error">{errorMessage.fname}</Typography>}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" variant="outlined" value={lname} onChange={(e) => setLname(e.target.value)} />
                {errorMessage.lname && <Typography color="error">{errorMessage.lname}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email Address" variant="outlined" value={userMail} disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Province</InputLabel>
                  <Select label="Province" value={state} onChange={(e) => setState(e.target.value)}>
                    <MenuItem value="">
                      <em>Select a province</em>
                    </MenuItem>
                    {Object.keys(provinceDistricts).map((prov) => (
                      <MenuItem key={prov} value={prov}>
                        {prov}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errorMessage.state && <Typography color="error">{errorMessage.state}</Typography>}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>District</InputLabel>
                  <Select label="District" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
                    <MenuItem value="">
                      <em>Select a district</em>
                    </MenuItem>
                    {districts.map((dist) => (
                      <MenuItem key={dist} value={dist}>
                        {dist}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errorMessage.district && <Typography color="error">{errorMessage.district}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="City" variant="outlined" value={city} onChange={(e) => setCity(e.target.value)} />
                {errorMessage.city && <Typography color="error">{errorMessage.city}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Street" variant="outlined" value={street} onChange={(e) => setStreet(e.target.value)} />
                {errorMessage.street && <Typography color="error">{errorMessage.street}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Zip Code" variant="outlined" value={zipcode} onChange={(e) => setZipcode(e.target.value)} />
                {errorMessage.zipcode && <Typography color="error">{errorMessage.zipcode}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  variant="outlined"
                  type="number"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setMobile(value);
                    }
                  }}
                />
                {errorMessage.mobile && <Typography color="error">{errorMessage.mobile}</Typography>}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Cart Totals
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal</Typography>
              <Typography>Rs {totalFromCart.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Delivery fee</Typography>
              <Typography>Rs {deliveryFee.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" fontWeight="bold" mb={3}>
              <Typography>Total</Typography>
              <Typography>Rs {totalWithDelivery.toFixed(2)}</Typography>
            </Box>
            <Button variant="contained" color="primary" fullWidth onClick={handleCheckout}>
              Proceed to Payment
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCheckout;