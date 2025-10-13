// CreateOrderModal.tsx
import React, { useState } from "react";
import { Box, Button, TextField, Typography, Modal, Fade, IconButton, Backdrop } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { useCreateOrderMutation } from "../services/ordersApi";

interface CreateOrderModalProps {
    open: boolean;
    onClose: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ open, onClose }) => {
    const [newName, setNewName] = useState("");
    const [createOrder, { isLoading: creating }] = useCreateOrderMutation();

    const handleCreateOrder = async () => {
        if (!newName.trim()) {
            alert("Введите название заказа");
            return;
        }
        try {
            await createOrder({ name: newName }).unwrap();
            setNewName("");
            onClose();
        } catch (err) {
            alert(`Ошибка при создании заказа: ${err.data?.error || err.message}`);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 500 } }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 450,
                        bgcolor: "background.paper",
                        borderRadius: 4,
                        boxShadow: 24,
                        overflow: "hidden",
                    }}
                >
                    {/* Картинка */}
                    <Box
                        sx={{
                            height: 180,
                            backgroundImage: "url('orders.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            position: "relative",
                        }}
                    >
                        <IconButton
                            onClick={onClose}
                            sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                bgcolor: "rgba(255,255,255,0.7)",
                                "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Тело модалки */}
                    <Box sx={{ p: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Новый заказ
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
                            Введите название заказа, чтобы начать создавать фотопроект.
                        </Typography>

                        <TextField
                            label="Название заказа"
                            fullWidth
                            variant="outlined"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleCreateOrder}
                            disabled={creating}
                            sx={{
                                bgcolor: "#111",
                                "&:hover": { bgcolor: "#333" },
                                py: 1.2,
                                fontWeight: 600,
                            }}
                        >
                            {creating ? "Создание..." : "Создать заказ"}
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default CreateOrderModal;
