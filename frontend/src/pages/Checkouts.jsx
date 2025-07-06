import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Select,
    MenuItem,
    Button,
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { styled } from "@mui/material/styles";
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import { FaFilePdf } from 'react-icons/fa';
import { UserContext } from '../context/UserContext';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: "bold",
}));

const Checkouts = () => {
    const { User, authToken } = useContext(UserContext);
    const [checkouts, setCheckouts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const userId = User.user?.id || User.admin?.id;
    const [filterStatus, setFilterStatus] = useState('All');
    const [open, setOpen] = useState(false);
    const [selectedCheckout, setSelectedCheckout] = useState(null);

    const getCheckout = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/checkout/get', {
                headers: { token: authToken }
            });
            setCheckouts(response.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (authToken && userId) {
            getCheckout();
        }
    }, [authToken, userId]);

    const yourCheckouts = checkouts.filter(checkout => checkout.userId === userId);

    const handleFilterChange = (event) => {
        setFilterStatus(event.target.value);
    };

    const filteredCheckouts = filterStatus === 'All'
        ? yourCheckouts
        : yourCheckouts.filter(check => check.status === filterStatus);

    const searchCheckouts = filteredCheckouts.filter(yck =>
        yck.fname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const deleteCheckout = async (_id, status) => {
        if (status === 'Completed') {
            alert('This checkout is already completed and cannot be deleted.');
            return;
        }
        try {
            if (window.confirm('Are you sure to delete this ?')) {
                await axios.delete(`http://localhost:4000/api/checkout/delete/${_id}`, {
                    headers: { token: authToken }
                });
                setCheckouts((prevCheck) => prevCheck.filter((checkout) => checkout._id !== _id));
            }
        } catch (error) {
            console.error('Axios error: ', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "red";
            case "In Progress":
                return "blue";
            case "Completed":
                return "green";
            default:
                return "black";
        }
    };

    const generatePDF = (checkout) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Checkout Details', 14, 22);
        doc.setFontSize(12);
        const data = [
            ['First Name', checkout.fname],
            ['Last Name', checkout.lname],
            ['Email', checkout.userMail],
            ['Phone', checkout.mobile],
            ['Total', `${checkout.total} LKR`],
            ['Created At', new Date(checkout.createdAt).toLocaleString()],
            ['Status', checkout.status],
        ];
        data.forEach((item, index) => {
            doc.text(`${item[0]}: ${item[1]}`, 14, 40 + (index * 10));
        });
        doc.text('Items:', 14, 40 + (data.length * 10));
        autoTable(doc, {
            startY: 50 + (data.length * 10),
            head: [['Product Name', 'Quantity', 'Price (LKR)']],
            body: checkout.items.map(item => [
                item.productname,
                item.quantity,
                item.price.toFixed(2)
            ]),
            theme: "grid",
            headStyles: { fillColor: [34, 102, 102], textColor: [255, 255, 255], fontStyle: "bold" },
            styles: { fontSize: 10, cellPadding: 3 }
        });
        doc.save(`checkout_${checkout._id}.pdf`);
    };

    const generateAllPDF = (checkouts) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("All Checkouts Report", 14, 22);
        autoTable(doc, {
            startY: 30,
            head: [["First Name", "Last Name", "Email", "Phone", "Total (LKR)", "Created At", "Status", "Items"]],
            body: checkouts.map((checkout) => [
                checkout.fname,
                checkout.lname,
                checkout.userMail,
                checkout.mobile,
                `${checkout.total} LKR`,
                new Date(checkout.createdAt).toLocaleString(),
                checkout.status,
                checkout.items.map(item => `${item.productname} (Qty: ${item.quantity}, Price: ${item.price.toFixed(2)} LKR)`).join('; ')
            ]),
            theme: "grid",
            headStyles: { fillColor: [34, 102, 102], textColor: [255, 255, 255], fontStyle: "bold" },
            styles: { fontSize: 10, cellPadding: 3 }
        });
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);
        doc.save("All_Checkouts_Report.pdf");
    };

    const handleOpenModal = (checkout) => {
        setSelectedCheckout(checkout);
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setSelectedCheckout(null);
    };

    return (
        <Box sx={{ margin: "auto", padding: 4 }}>
            <Button
                variant="outlined"
                color="primary"
                onClick={() => generateAllPDF(searchCheckouts.slice().reverse())}
                sx={{ ml: 0, mb: 3 }}
            >
                Download All Checkouts
            </Button>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Your Checkouts
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <TextField
                    label="Search by name"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: "50%" }}
                />
                <Select value={filterStatus} onChange={handleFilterChange}>
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                </Select>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                            <TableCell><strong>First Name</strong></TableCell>
                            <TableCell><strong>Last Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Phone</strong></TableCell>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell><strong>Created At</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Items</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {searchCheckouts.slice().reverse().map((checkout) => (
                            <TableRow key={checkout._id}>
                                <TableCell>{checkout.fname}</TableCell>
                                <TableCell>{checkout.lname}</TableCell>
                                <TableCell>{checkout.userMail}</TableCell>
                                <TableCell>{checkout.mobile}</TableCell>
                                <TableCell>{checkout.total} LKR</TableCell>
                                <TableCell>{new Date(checkout.createdAt).toLocaleDateString()} - {new Date(checkout.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: getStatusColor(checkout.status) }}>
                                    {checkout.status}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="text"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleOpenModal(checkout)}
                                    >
                                        View Items
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => deleteCheckout(checkout._id, checkout.status)}
                                        disabled={checkout.status === "Completed"}
                                        sx={{ mr: 1 }}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        onClick={() => generatePDF(checkout)}
                                        sx={{ mr: 1 }}
                                    >
                                        <FaFilePdf />
                                    </Button>
                                    
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleCloseModal}>
                <DialogTitle>Checkout Items</DialogTitle>
                <DialogContent>
                    {selectedCheckout && (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Product Name</StyledTableCell>
                                        <StyledTableCell>Quantity</StyledTableCell>
                                        <StyledTableCell>Price (LKR)</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedCheckout.items.map((item) => (
                                        <TableRow key={item._id}>
                                            <TableCell>{item.productname}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.price.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Checkouts;