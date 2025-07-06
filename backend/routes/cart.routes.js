import express from 'express';
import {
    createCartItem,
    getAllCartItems,
    getCartItemById,
    updateCartItem,
    deleteCartItem,
    bulkDeleteAndUpdate,
} from '../controllers/cart.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post('/create', authMiddleware, createCartItem);
cartRouter.get('/get', authMiddleware, getAllCartItems);
cartRouter.get('/get/:id', authMiddleware, getCartItemById);
cartRouter.put('/update/:id', authMiddleware, updateCartItem);
cartRouter.delete('/delete/:id', authMiddleware, deleteCartItem);
cartRouter.post('/bulk-delete-and-update', authMiddleware, bulkDeleteAndUpdate);

export default cartRouter;