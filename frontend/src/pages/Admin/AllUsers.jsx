import { Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useContext, useEffect, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { UserContext } from '../../context/UserContext';

const AllUsers = () => {
  const { User, authToken } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userMail = user.email || null;
  const admin = userMail === 'adminmail@gmail.com';
  const userId = User.admin?.id || User.user?.id;

  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/user/all');
      setUsers(Array.isArray(response.data.data.allUser) ? response.data.data.allUser : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.post(`http://localhost:4000/api/user/delete/${id}`, {}, {
        headers: {
          'user-id': userId,
          'is-admin': 'true',
          token: authToken,
        },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const genpdf = (user) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('User Details Report', 20, 20);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text('User ID:', 20, 40);
    doc.text(user._id, 60, 40);
    doc.text('Name:', 20, 50);
    doc.text(user.name, 60, 50);
    doc.text('Email:', 20, 60);
    doc.text(user.email, 60, 60);
    doc.text('Role:', 20, 70);
    doc.text(user.role, 60, 70);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.save(`User_${user.name}.pdf`);
  };

  const genAllpdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('All Users Report', 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['User ID', 'Name', 'Email', 'Role']],
      body: users.map((user) => [user._id, user.name, user.email, user.role]),
      theme: 'grid',
      headStyles: {
        fillColor: [210, 105, 30],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);
    doc.save('All_Users_Report.pdf');
  };

  useEffect(() => {
    getUsers();
  }, []);

  const searchUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <div className='flex justify-between items-center my-2'>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          All Users
        </Typography>
        <Button
          className='!p-3'
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<FaFilePdf />}
          onClick={genAllpdf}
        >
          Export All as PDF
        </Button>
      </div>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Search by name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: '50%' }}
        />
      </Box>
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchUsers.length > 0 ? (
                searchUsers.slice().reverse().map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user._id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => deleteUser(user._id)}
                        disabled={user.email === 'adminmail@gmail.com'}
                      >
                        Delete
                      </Button>
                      <Button
                        color="error"
                        startIcon={<FaFilePdf />}
                        style={{ marginLeft: '5px' }}
                        onClick={() => genpdf(user)}
                      >
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Users Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AllUsers;