import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Typography, Box, Dialog, DialogTitle, IconButton, DialogContent, TextField, DialogActions } from "@mui/material";
import { FaUserCircle, FaSignOutAlt, FaTrash, FaEdit, FaTimes } from "react-icons/fa";
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const Profile = () => {
    const { User, authToken, logoutUser } = useContext(UserContext);
    const navigate = useNavigate();
    console.log(User)
    const userData = User.user || User.admin;
    const userMail = userData?.email || '';
    const userId = userData?.id || '';
    const userName = userData?.name || '';
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userMail);

    const signOutUser = () => {
        if (window.confirm('Are you sure ?')) {
            logoutUser();
            navigate("/");
        }
    };

    const deleteUser = async () => {
        if (window.confirm('Are you sure to delete your account ?')) {
            try {
                await axios.post(`http://localhost:4000/api/user/delete/${userId}`, {}, {
                    headers: { token: authToken }
                });
                logoutUser();
                navigate("/");
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete account');
            }
        }
    };

    const updateUser = async () => {
        if (window.confirm('You need to re-login when updating your profile details.. Ok ?')) {
            try {
                await axios.post(`http://localhost:4000/api/user/update/${userId}`, {
                    name,
                    email,
                    role: userData.role
                }, {
                    headers: { token: authToken }
                });
                logoutUser();
                navigate("/login");
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to update profile');
            }
        }
    };

    return (

        <>
            <Card sx={{
                maxWidth: 400,
                margin: "auto",
                textAlign: "center",
                borderRadius: "15px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                padding: 3,
                background: "linear-gradient(135deg, #D1D5DB, #fff)",
                color: "#fff"
            }}>
                <CardContent>
                    <FaUserCircle size={60} style={{ marginLeft: '30%' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>{userName}</Typography>
                    <Typography variant="body1" sx={{ color: "black" }}>{userMail}</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<FaEdit />}
                            onClick={() => setOpen(true)}
                            sx={{ backgroundColor: "#FFD700", color: "#000", fontWeight: 600 }}
                        >
                            Update Account
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<FaTrash />}
                            onClick={deleteUser}
                            sx={{ backgroundColor: "red", color: "#fff", fontWeight: 600 }}
                        >
                            Delete Account
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<FaSignOutAlt />}
                            onClick={signOutUser}
                            sx={{ backgroundColor: "#000", color: "#fff", fontWeight: 600 }}
                        >
                            Logout
                        </Button>
                    </Box>
                </CardContent>
            </Card>
            <Dialog open={open}>
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Update details
                    <IconButton onClick={() => setOpen(false)}>
                        <FaTimes />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={updateUser}>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Profile;