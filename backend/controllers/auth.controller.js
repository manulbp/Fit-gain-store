import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import userModel from '../models/user.model.js';
import PasswordReset from '../models/passwordReset.model.js';
import nodemailer from 'nodemailer';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User Doesn't Exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = createToken(user._id);

        res.json({
            success: true,
            token,
            name: user.name,
            role: user.role,
            id: user._id
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message,
        });
    }
};

const registerUser = async (req, res) => {
    const { name, password, email } = req.body;

    try {
        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.json({ success: false, message: "User Already Exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please Enter Valid Email" });
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Please Enter a Strong Password",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({
            success: true,
            token,
            name: user.name,
            role: user.role,
            id: user._id
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message,
        });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        // Store reset code
        await PasswordReset.deleteMany({ userId: user._id }); // Remove old codes
        const reset = new PasswordReset({
            userId: user._id,
            code,
            expiresAt,
        });
        await reset.save();

        // Send email with reset code
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `http://localhost:5173/reset-password?email=${encodeURIComponent(email)}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${code}\n\nUse this code to reset your password: ${resetLink}\n\nThis code expires in 15 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Reset code sent to your email' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to send reset code', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { email, code, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const reset = await PasswordReset.findOne({ userId: user._id, code });
        if (!reset) {
            return res.json({ success: false, message: 'Invalid or expired code' });
        }

        if (reset.expiresAt < new Date()) {
            await PasswordReset.deleteOne({ _id: reset._id });
            return res.json({ success: false, message: 'Code has expired' });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        await user.save();

        await PasswordReset.deleteOne({ _id: reset._id });

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to reset password', error: error.message });
    }
};

export { loginUser, registerUser, forgotPassword, resetPassword };