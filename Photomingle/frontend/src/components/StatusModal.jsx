import React, {useEffect, useState} from 'react';
import { Modal, Box, Typography, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import {useUpdateOrderStatusMutation} from "../services/ordersApi";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#fff',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
};

const STATUSES = [
    { value: 'In Creation', label: 'In Creation' },
    { value: 'In Work', label: 'In Work' },
    { value: 'Ready', label: 'Ready' },
];

export default function StatusModal({ open, onClose, order }) {
    const [status, setStatus] = useState(order?.status || '');
    const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

    const handleSubmit = async () => {
        try {
            updateStatus({ orderId: order.id, status });
            onClose(true);
        } catch (err) {
            console.error(err);
        }
    };

    const [selectedOrderToDelete, setSelectedOrderToDelete] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const handleDeleteClick = (row) => {
        setSelectedOrderToDelete(row);
        setOpenDeleteModal(true);
    };

    const handleDeleteModalClose = (deleted) => {
        setOpenDeleteModal(false);
        setSelectedOrderToDelete(null);
    };

    useEffect(() => {
        setStatus(order?.status);
    }, [order?.status]);

    return (
        <Modal open={open} onClose={() => onClose(false)}>
            <Box sx={modalStyle}>
                <Typography variant="h6" sx={{ mb: 2 }}>Изменить статус заказа</Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Статус</InputLabel>
                    <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Статус">
                        {STATUSES.map((s) => (
                            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={() => onClose(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
                        Сохранить
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
