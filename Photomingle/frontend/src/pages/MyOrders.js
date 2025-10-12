import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from "react-router-dom";
import ResponsiveAppBar from "../components/ResponsiveAppBar";
import { useGetOrdersQuery, useCreateOrderMutation } from "../services/ordersApi";

export default function MyOrdersPage() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    const navigate = useNavigate();
    const { data: orders = [], error, isLoading, refetch } = useGetOrdersQuery({search:debouncedSearch});
    const [createOrder, { isLoading: creating }] = useCreateOrderMutation();

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleCreateOrder = async () => {
        if (!newName.trim()) {
            alert('Введите название заказа');
            return;
        }
        try {
            await createOrder({ name: newName }).unwrap();
            setNewName('');
            setShowCreateForm(false);
            refetch();
        } catch (err) {
            alert(`Ошибка при создании заказа: ${err.data?.error || err.message}`);
        }
    };

    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
            {/* Хэдер */}
            <ResponsiveAppBar />

            {/* Контент */}
            <Box sx={{ maxWidth: 1000, mx: 'auto', p: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <TextField
                        variant="outlined"
                        placeholder="Поиск по заказам..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            flex: 1,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            input: { color: '#111' },
                        }}
                    />
                    <Button
                        variant="contained"
                        color="#aaaaaa"
                        startIcon={<AddIcon />}
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        sx={{ width: '120px', textTransform: 'none' }}
                    >
                        Добавить
                    </Button>
                </Box>

                {/* Список заказов */}
                {isLoading ? (
                    <Typography textAlign="center">Загрузка заказов...</Typography>
                ) : error ? (
                    <Typography textAlign="center" color="error.main">Ошибка загрузки</Typography>
                ) : orders.length === 0 ? (
                    <Typography textAlign="center">У вас пока нет заказов.</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {orders.map((order) => (
                            <Paper
                                key={order.id}
                                elevation={6}
                                sx={{
                                    p: 3,
                                    bgcolor: '#111',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Link
                                    to={`/orders/${order.id}`}
                                    style={{
                                        textDecoration: 'none',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    {order.name}
                                </Link>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
