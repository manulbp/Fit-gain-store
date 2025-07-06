import React, { useState, useEffect, useContext } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    Checkbox,
} from '@mui/material';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { CartContext } from '../context/CartContext';
import { assets } from '../assets/assets';
import axios from 'axios';

const Cart = () => {
    const { authToken } = useContext(UserContext);
    const { cartItems, removeFromCart, fetchCartItems } = useContext(CartContext);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (authToken) {
            fetchCartItems().then(() => setLoading(false));
        } else {
            setError('Please log in to view your cart');
            setLoading(false);
        }
    }, [authToken, fetchCartItems]);

    const deleteCartItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await removeFromCart(id);
            setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
            alert('Item deleted successfully');
        } catch (error) {
            console.error('Error deleting cart item:', error);
            alert(error.message || 'Failed to delete item');
        }
    };

    const handleItemSelect = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map((item) => item._id));
        }
        setSelectAll(!selectAll);
    };

    const totalCost = cartItems
        .filter((item) => selectedItems.includes(item._id))
        .reduce((total, item) => total + item.quantity * item.product.price, 0);

    const handleCheckout = async () => {
        const selectedCartItems = cartItems
            .filter((item) => selectedItems.includes(item._id))
            .map((item) => ({
                _id: item._id,
                productName: item.product.productname,
                quantity: item.quantity,
                price: item.product.price,
            }));
        console.log(selectedCartItems);

        try {
            // Call backend to delete selected cart items and update product quantities
            await axios.post(
                'http://localhost:4000/api/cart/bulk-delete-and-update',
                { itemIds: selectedItems },
                { headers: { token: authToken } }
            );

            // Navigate to add-checkout page
            navigate('/add-checkout', {
                state: {
                    total: totalCost.toFixed(2),
                    items: selectedCartItems,
                },
            });
        } catch (error) {
            console.error('Error during checkout:', error);
            alert(error.response?.data?.message || 'Failed to process checkout');
        }
    };

    return (
        <div className='container mx-auto p-2'>
            <br />
            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <Typography>Loading...</Typography>
                </Box>
            )}
            {error && (
                <Box display="flex" justifyContent="center" my={4}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}
            {!loading && !error && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                                <TableCell padding="checkbox">
                                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                                </TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Condition</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Unit Price (LKR)</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cartItems.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedItems.includes(item._id)}
                                            onChange={() => handleItemSelect(item._id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex justify-start items-center gap-2'>
                                            <img
                                                src={`http://localhost:4000/${item.product.image}`}
                                                alt=""
                                                className='w-12 aspect-square'
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = assets.noImage;
                                                }}
                                            />
                                            <p>{item.product.productname}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.product.category || 'N/A'}</TableCell>
                                    <TableCell>{item.product.condition || 'N/A'}</TableCell>
                                    <TableCell>{item.product.quantity}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button color="error" onClick={() => deleteCartItem(item._id)}>
                                            <FaTrash />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {cartItems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        Your cart is empty
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {!loading && !error && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mr: 2 }}>
                    <Card sx={{ width: 300, p: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Cart Summary
                            </Typography>
                            <Typography variant="body1">
                                Total Cost: <strong>LKR {totalCost.toFixed(2)}</strong>
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={handleCheckout}
                                disabled={selectedItems.length === 0}
                            >
                                Proceed to Checkout
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                                style={{ backgroundColor: 'black' }}
                                onClick={() => navigate('/checkout')}
                            >
                                Your checkouts
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            )}
            <br />
            <br />
        </div>
    );
};

export default Cart;