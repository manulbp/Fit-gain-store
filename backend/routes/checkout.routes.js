import express from 'express';
import { addCheckout, getCheckout, deleteCheckout, statusupdate, all, adminStatusUpdate, adminDeleteCheckout } from '../controllers/checkout.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const checkoutRouter = express.Router();

checkoutRouter.post('/add', authMiddleware, addCheckout);
checkoutRouter.get('/all', authMiddleware, all);
checkoutRouter.get('/get', authMiddleware, getCheckout);
checkoutRouter.delete('/delete/:id', authMiddleware, deleteCheckout);
checkoutRouter.patch('/update/:id/status', authMiddleware, statusupdate);
checkoutRouter.patch('/admin/update/:id/status', authMiddleware, adminStatusUpdate);
checkoutRouter.delete('/admin/delete/:id', authMiddleware, adminDeleteCheckout);

export default checkoutRouter;