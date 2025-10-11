import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import {useDeleteOrderMutation} from "./services/ordersApi";

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

interface DeleteOrderModalProps {
    open: boolean;
    onClose: (deleted?: boolean) => void;
    order: { id: string; name: string } | null;
}

export default function DeleteOrderModal({ open, onClose, order }: DeleteOrderModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteOrder] = useDeleteOrderMutation();

    if (!order) return null;

    const handleDelete = async () => {
        if (!order) return;
        setIsDeleting(true);
        try {
            await deleteOrder(order.id).unwrap();
            onClose(true); // подтверждение удаления
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
        }
    };

    return (
        <Modal open={open} onClose={() => onClose(false)}>
            <Box sx={modalStyle}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Подтвердите удаление
                </Typography>
                <Typography sx={{ mb: 3 }}>
                    Вы уверены, что хотите удалить заказ: <strong>{order.name}</strong>?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={() => onClose(false)} disabled={isDeleting}>
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        Удалить
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
