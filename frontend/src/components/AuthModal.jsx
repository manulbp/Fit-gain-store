import React, { useState, useContext } from 'react';
import * as Yup from 'yup';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    IconButton,
    Grid,
    Box,
} from '@mui/material';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';

const AuthModal = ({ open, onClose }) => {
    const { loginUser, registerUser } = useContext(UserContext);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confPassword, setConfPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const loginSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const registerSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters'),
        confPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const forgotPasswordSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email address').required('Email is required'),
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({});
        setServerError('');
        try {
            await loginSchema.validate({ email, password }, { abortEarly: false });
            await loginUser(email, password);
            setEmail('');
            setPassword('');
            onClose();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const errorObj = {};
                error.inner.forEach((err) => {
                    errorObj[err.path] = err.message;
                });
                setErrors(errorObj);
            } else {
                setServerError(error.message || 'Login failed');
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors({});
        setServerError('');
        try {
            await registerSchema.validate({ name, email, password, confPassword }, { abortEarly: false });
            await registerUser(name, email, password);
            setName('');
            setEmail('');
            setPassword('');
            setConfPassword('');
            setStep(1);
            onClose();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const errorObj = {};
                error.inner.forEach((err) => {
                    errorObj[err.path] = err.message;
                });
                setErrors(errorObj);
            } else {
                setServerError(error.message || 'Registration failed');
            }
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true)
        setServerError('');
        try {
            await forgotPasswordSchema.validate({ email }, { abortEarly: false });
            const response = await axios.post('http://localhost:4000/api/auth/forgot-password', { email });
            if (response.data.success) {
                setServerError('Reset code sent to your email. Please check your inbox.');
                setLoading(false)
            } else {
                setServerError(response.data.message || 'Failed to send reset code');
                setLoading(false)
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const errorObj = {};
                error.inner.forEach((err) => {
                    errorObj[err.path] = err.message;
                });
                setErrors(errorObj);
                setLoading(false)
            } else {
                setServerError(error.response?.data?.message || 'Failed to send reset code');
                setLoading(false)
            }
        }
    };

    const handleClose = () => {
        setStep(1);
        setEmail('');
        setPassword('');
        setName('');
        setConfPassword('');
        setErrors({});
        setServerError('');
        onClose();
        setLoading(false)
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            {step === 1 && (
                <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Login
                        <IconButton onClick={handleClose}>
                            <FaTimes />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2 }}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 2 }}
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                            {serverError && (
                                <Typography color="error" sx={{ mb: 2 }}>
                                    {serverError}
                                </Typography>
                            )}

                            <div className="w-full flex flex-col justify-center items-center gap-3">
                                <Typography variant="body2">
                                    <span
                                        style={{ color: '#D2691E', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={() => setStep(3)}
                                        className='hover:!underline !font-normal'
                                    >
                                        Forgot Password ?
                                    </span>
                                </Typography>
                                <Button variant="contained" fullWidth color="primary" onClick={handleLogin}>
                                    Login
                                </Button>

                                <Typography variant="body2">
                                    Don't have an account?{' '}
                                    <span
                                        style={{ color: '#D2691E', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={() => setStep(2)}
                                    >
                                        Register here
                                    </span>
                                </Typography>
                            </div>
                        </Box>
                    </DialogContent>
                </>
            )}
            {step === 2 && (
                <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IconButton onClick={() => setStep(1)}>
                            <FaArrowLeft />
                        </IconButton>
                        Sign Up
                    </DialogTitle>
                    <DialogContent sx={{ paddingTop: 10 }}>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                sx={{ mb: 2 }}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2 }}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 2 }}
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                variant="outlined"
                                type="password"
                                value={confPassword}
                                onChange={(e) => setConfPassword(e.target.value)}
                                sx={{ mb: 2 }}
                                error={!!errors.confPassword}
                                helperText={errors.confPassword}
                            />
                            {serverError && (
                                <Typography color="error" sx={{ mb: 2 }}>
                                    {serverError}
                                </Typography>
                            )}
                            <div className='w-full flex flex-col justify-between items-center'>
                                <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>
                                    Register
                                </Button>
                                <Typography variant="body2">
                                    Already have an account?{' '}
                                    <span
                                        style={{ color: '#D2691E', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={() => setStep(1)}
                                    >
                                        Log In
                                    </span>
                                </Typography>
                            </div>
                        </Box>
                    </DialogContent>
                </>
            )}
            {step === 3 && (
                <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Forgot Password
                        <IconButton onClick={handleClose}>
                            <FaTimes />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2 }}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                            {serverError && (
                                <Typography color={serverError.includes('sent') ? 'primary' : 'error'} sx={{ mb: 2 }}>
                                    {serverError}
                                </Typography>
                            )}
                            <div className="w-full flex flex-col justify-center items-center gap-3">
                                
                                {!serverError ? (
                                    <Button disabled={Boolean(loading)} variant="contained" fullWidth color="primary" onClick={handleForgotPassword}>
                                        {loading ? (
                                            <div className='flex justify-center items-center gap-2'>
                                                <span>Submitting... </span>
                                                <LoaderCircle className='animate-spin transition-all ' size={16} />
                                            </div>
                                        ) : (
                                            <span>Submit</span>
                                        )}

                                    </Button>
                                ) : (
                                    <Button onClick={handleClose} variant="contained" fullWidth color="primary">
                                        Okay
                                    </Button>
                                )}
                                <Typography variant="body2">
                                    <span
                                        style={{ color: '#D2691E', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={() => setStep(1)}
                                    >
                                        Back to Login
                                    </span>
                                </Typography>
                            </div>
                        </Box>
                    </DialogContent>
                </>
            )}
        </Dialog>
    );
};

export default AuthModal;