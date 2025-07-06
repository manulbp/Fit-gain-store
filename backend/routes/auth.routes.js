import express from 'express';
import { forgotPassword, loginUser, registerUser, resetPassword } from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/register',registerUser)
authRouter.post('/login',loginUser)
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

export default authRouter;