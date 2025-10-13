import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/usersApi';
import { Box, CircularProgress, Paper, TextField, Typography, Button, Link } from '@mui/material';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [register, { isLoading }] = useRegisterMutation();
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        try {
            await register({ email, password }).unwrap();
            alert('Регистрация прошла успешно!');
            navigate('/login');
        } catch (err) {
            alert(err.data?.error || 'Ошибка регистрации');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#fff',
                p: 2,
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    bgcolor: '#000',
                    color: '#fff',
                    p: 4,
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <Typography variant="h5" component="h2" textAlign="center">
                    Регистрация
                </Typography>
                <TextField
                    variant="filled"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    InputProps={{ sx: { color: '#fff' } }}
                    InputLabelProps={{ sx: { color: '#fff' } }}
                    sx={{ bgcolor: '#222', borderRadius: 1 }}
                />
                <TextField
                    variant="filled"
                    label="Пароль"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    InputProps={{ sx: { color: '#fff' } }}
                    InputLabelProps={{ sx: { color: '#fff' } }}
                    sx={{ bgcolor: '#222', borderRadius: 1 }}
                />
                <TextField
                    variant="filled"
                    label="Подтверждение пароля"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    InputProps={{ sx: { color: '#fff' } }}
                    InputLabelProps={{ sx: { color: '#fff' } }}
                    sx={{ bgcolor: '#222', borderRadius: 1 }}
                />

                <Button
                    variant="contained"
                    onClick={handleRegister}
                    disabled={isLoading}
                    fullWidth
                    sx={{ mt: 1, bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: '#eee' } }}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
                </Button>

                <Typography textAlign="center" variant="body2" sx={{ mt: 2 }}>
                    Уже есть аккаунт?{' '}
                    <Link
                        component="button"
                        underline="hover"
                        sx={{ color: '#00bcd4' }}
                        onClick={() => navigate('/login')}
                    >
                        Войти
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default RegisterPage;
