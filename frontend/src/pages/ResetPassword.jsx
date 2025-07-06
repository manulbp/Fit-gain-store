import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    IconButton,
} from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const resetSchema = Yup.object().shape({
        code: Yup.string().required('Reset code is required'),
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters'),
        confPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrors({});
        setServerError('');
        try {
            await resetSchema.validate({ code, password, confPassword }, { abortEarly: false });
            const response = await axios.post('http://localhost:4000/api/auth/reset-password', {
                email,
                code,
                password,
            });
            if (response.data.success) {
                setServerError('Password reset successfully. Please log in.');
                setTimeout(() => navigate('/'), 2000);
            } else {
                setServerError(response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const errorObj = {};
                error.inner.forEach((err) => {
                    errorObj[err.path] = err.message;
                });
                setErrors(errorObj);
            } else {
                setServerError(error.response?.data?.message || 'Failed to reset password');
            }
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
            <Paper sx={{ p: 4, width: '100%', maxWidth: 400, position: 'relative' }}>
                <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => navigate('/')}>
                    <FaTimes />
                </IconButton>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                    Reset Password
                </Typography>
                <Box component="form" onSubmit={handleResetPassword}>
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        value={email}
                        disabled
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Reset Code"
                        variant="outlined"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        sx={{ mb: 2 }}
                        error={!!errors.code}
                        helperText={errors.code}
                    />
                    <TextField
                        fullWidth
                        label="New Password"
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
                        <Typography color={serverError.includes('successfully') ? 'primary' : 'error'} sx={{ mb: 2 }}>
                            {serverError}
                        </Typography>
                    )}
                    <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mb: 2 }}>
                        Reset Password
                    </Button>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        Back to{' '}
                        <span
                            style={{ color: '#D2691E', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            Login
                        </span>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default ResetPassword;