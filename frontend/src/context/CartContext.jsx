import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreContext } from './StoreContext';
import { UserContext } from './UserContext';
import axios from 'axios';

export const CartContext = createContext();

const CartContextProvider = ({ children }) => {
    const { serverURL } = useContext(StoreContext);
    const { authToken } = useContext(UserContext);
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart items from backend
    const fetchCartItems = async () => {
        if (!authToken) {
            setCartItems([]);
            setCartCount(0);
            return;
        }
        try {
            const response = await axios.get(`${serverURL}/api/cart/get`, {
                headers: { token: authToken },
            });
            const items = Array.isArray(response.data.data) ? response.data.data : [];
            setCartItems(items);
            setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
        } catch (error) {
            console.error('Error fetching cart items:', error);
            setCartItems([]);
            setCartCount(0);
        }
    };

    // Add item to cart and update product quantity
    const addToCart = async (productId, quantity) => {
        if (!authToken) {
            throw new Error('Please log in to add items to your cart');
        }
        try {
            // First update the product quantity in the database
            await axios.put(
                `${serverURL}/api/product/update-quantity/${productId}`,
                { quantity },
                { headers: { token: authToken } }
            );
            
            // Then add to cart
            const response = await axios.post(
                `${serverURL}/api/cart/create`,
                { product: productId, quantity },
                { headers: { token: authToken } }
            );
            
            await fetchCartItems(); // Refresh cart
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    // Remove item from cart
    const removeFromCart = async (cartItemId) => {
        if (!authToken) {
            throw new Error('Please log in to modify your cart');
        }
        try {
            await axios.delete(`${serverURL}/api/cart/delete/${cartItemId}`, {
                headers: { token: authToken },
            });
            await fetchCartItems(); // Refresh cart
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to remove from cart');
        }
    };

    // Fetch cart items when authToken changes (login/logout)
    useEffect(() => {
        fetchCartItems();
    }, [authToken]);

    return (
        <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, fetchCartItems }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContextProvider;