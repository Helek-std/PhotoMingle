import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoginMutation } from "../services/usersApi";
import { Box, CircularProgress, Paper, TextField, Typography, Button, Link } from "@mui/material";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [login, { isLoading: loggingIn }] = useLoginMutation();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await login({ email, password }).unwrap();
            navigate('/');
        } catch (err) {
            alert(err.data?.error || 'Ошибка входа');
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
                    Вход
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

                <Button
                    variant="contained"
                    onClick={handleLogin}
                    disabled={loggingIn}
                    fullWidth
                    sx={{ mt: 1, bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: '#eee' } }}
                >
                    {loggingIn ? <CircularProgress size={24} /> : 'Войти'}
                </Button>

                <Typography textAlign="center" variant="body2" sx={{ mt: 2 }}>
                    Нет аккаунта?{' '}
                    <Link
                        component="button"
                        underline="hover"
                        sx={{ color: '#00bcd4' }}
                        onClick={() => navigate('/register')}
                    >
                        Зарегистрироваться
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default LoginPage;
