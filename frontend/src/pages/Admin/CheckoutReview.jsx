import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useContext, useEffect, useState } from 'react';
import { FaCheck, FaFilePdf, FaTimes } from 'react-icons/fa';
import { UserContext } from '../../context/UserContext';

const CheckoutReview = () => {
  const { User, authToken } = useContext(UserContext);
  const [checkouts, setCheckouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [rowStatus, setRowStatus] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchCheckouts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/checkout/all', {
        headers: { token: authToken },
      });
      setCheckouts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to retrieve checkouts');
    }
  };

  useEffect(() => {
    if (authToken && (User.user?.role === 'admin' || User.admin?.role === 'admin')) {
      fetchCheckouts();
    }
  }, [authToken, User]);

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const filteredCheckouts = filterStatus === 'All'
    ? checkouts
    : checkouts.filter((check) => check.status === filterStatus);
  const searchCheckouts = filteredCheckouts.filter((check) =>
    check.fname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteCheckout = async (id, status) => {
    if (status === 'Completed') {
      alert('Cannot delete a completed checkout');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this checkout?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/checkout/admin/delete/${id}`, {
        headers: {
          token: authToken,
          'is-admin': User.admin?.role === 'admin' ? 'true' : 'false',
        },
      });
      setCheckouts((prev) => prev.filter((check) => check._id !== id));
      alert('Checkout deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete checkout');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/checkout/admin/update/${id}/status`,
        { status },
        {
          headers: {
            token: authToken,
            'is-admin': User.admin?.role === 'admin' ? 'true' : 'false',
          },
        }
      );
      if (response.status === 200) {
        setCheckouts((prev) =>
          prev.map((check) => (check._id === id ? { ...check, status } : check))
        );
        alert(`Checkout updated to ${status.toLowerCase()}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'red';
      case 'In Progress':
        return 'blue';
      case 'Completed':
        return 'green';
      default:
        return 'black';
    }
  };

  const handleStatusChange = (id, value) => {
    setRowStatus((prev) => ({ ...prev, [id]: value }));
  };

  const generatePDF = (checkout) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Checkout Details', 14, 22);
    doc.setFontSize(12);
    const details = [
      ['First Name', checkout.fname || 'N/A'],
      ['Last Name', checkout.lname || 'N/A'],
      ['Email', checkout.userMail || 'N/A'],
      ['Phone', checkout.mobile || 'N/A'],
      ['Total', checkout.total ? `${checkout.total} LKR` : 'N/A'],
      ['Created At', checkout.createdAt ? new Date(checkout.createdAt).toLocaleString() : 'N/A'],
      ['Status', checkout.status || 'N/A'],
    ];
    details.forEach((item, index) => {
      doc.text(`${item[0]}: ${item[1]}`, 14, 40 + index * 10);
    });
    doc.text('Items:', 14, 40 + details.length * 10);
    autoTable(doc, {
      startY: 50 + details.length * 10,
      head: [['Product Name', 'Quantity', 'Price (LKR)']],
      body: Array.isArray(checkout.items)
        ? checkout.items.map((item) => [
          item.productname || 'N/A',
          item.quantity || 'N/A',
          item.price ? item.price.toFixed(2) : 'N/A',
        ])
        : [['No items', '', '']],
      theme: 'grid',
      headStyles: { fillColor: [34, 102, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
    });
    doc.save(`checkout_${checkout._id}.pdf`);
  };

  const generateAllPDF = (checkouts) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('All Checkouts Report', 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['First Name', 'Last Name', 'Email', 'Phone', 'Total (LKR)', 'Created At', 'Status', 'Items']],
      body: checkouts.map((check) => [
        check.fname || 'N/A',
        check.lname || 'N/A',
        check.userMail || 'N/A',
        check.mobile || 'N/A',
        check.total ? `${check.total} LKR` : 'N/A',
        check.createdAt ? new Date(check.createdAt).toLocaleString() : 'N/A',
        check.status || 'N/A',
        Array.isArray(check.items)
          ? check.items.map((item) => `${item.productname} (Qty: ${item.quantity}, Price: ${item.price.toFixed(2)} LKR)`).join('; ')
          : 'No items',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [34, 102, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
    });
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);
    doc.save('All_Checkouts_Report.pdf');
  };

  const handleOpenModal = (items) => {
    setSelectedItems(items);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItems([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <div className='flex justify-between items-center my-2'>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          All Checkouts
        </Typography>
        <Button
          className='!p-3'
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<FaFilePdf />}
          onClick={() => generateAllPDF(searchCheckouts.slice().reverse())}
        >
          Download All Checkouts
        </Button>
      </div>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Search by first name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: '50%' }}
        />
        <Select value={filterStatus} onChange={handleFilterChange} sx={{ minWidth: 150 }}>
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      </Box>
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Created At</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Items</strong></TableCell>
              <TableCell><strong>Update</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {searchCheckouts.slice().reverse().map((checkout) => (
              <TableRow key={checkout._id}>
                <TableCell>
                  <div className='flex flex-col justify-start items-start'>
                    <p>{checkout.fname || 'N/A'}{" "}{checkout.lname || 'N/A'}</p>
                    <Tooltip title={`Send Mail to ${checkout.userMail}`}>
                      <a href={`mailto:${checkout.userMail}`}
                        className='text-sm text-neutral-500 font-normal cursor-pointer hover:underline'>
                        {checkout.userMail || 'N/A'}
                      </a>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <a href={`tel:${checkout.mobile}`}>{checkout.mobile || 'N/A'}</a>
                </TableCell>
                <TableCell>{checkout.total ? `${checkout.total} LKR` : 'N/A'}</TableCell>
                <TableCell>
                  {checkout.createdAt
                    ? `${new Date(checkout.createdAt).toLocaleDateString()} - ${new Date(checkout.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'N/A'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: getStatusColor(checkout.status) }}>
                  {checkout.status || 'N/A'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenModal(checkout.items)}
                  >
                    View Items
                  </Button>
                </TableCell>
                <TableCell>
                  <Select
                    value={rowStatus[checkout._id] || checkout.status || 'Pending'}
                    onChange={(e) => handleStatusChange(checkout._id, e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="Pending" sx={{ color: 'red' }}>Pending</MenuItem>
                    <MenuItem value="In Progress" sx={{ color: 'blue' }}>In Progress</MenuItem>
                    <MenuItem value="Completed" sx={{ color: 'green' }}>Completed</MenuItem>
                  </Select>
                  <Button
                    onClick={() => updateStatus(checkout._id, rowStatus[checkout._id] || checkout.status || 'Pending')}
                    sx={{ ml: 1 }}
                  >
                    <FaCheck />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => deleteCheckout(checkout._id, checkout.status)}
                    disabled={checkout.status === 'Completed'}
                    sx={{ mr: 1 }}
                  >
                    Delete
                  </Button>
                  <Button color="primary" onClick={() => generatePDF(checkout)}>
                    <FaFilePdf />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Checkout Items
          <IconButton onClick={handleCloseModal}>
            <FaTimes />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell><strong>Product Name</strong></TableCell>
                  <TableCell><strong>Quantity</strong></TableCell>
                  <TableCell><strong>Price (LKR)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(selectedItems) && selectedItems.length > 0 ? (
                  selectedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productname || 'N/A'}</TableCell>
                      <TableCell>{item.quantity || 'N/A'}</TableCell>
                      <TableCell>{item.price ? item.price.toFixed(2) : 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>No items</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CheckoutReview;