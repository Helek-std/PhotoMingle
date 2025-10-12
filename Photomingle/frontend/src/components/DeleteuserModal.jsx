import React from "react";
import { Box, Button, Modal, Typography } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

interface DeleteModalProps {
    open: boolean;
    handleClose: () => void;
    title?: string;
    message?: string;
    onConfirm: () => void;
}

export default function DeleteModal({ open, handleClose, title = "Удалить?", message, onConfirm }: DeleteModalProps) {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "#fff",
                    borderRadius: 3,
                    boxShadow: 3,
                    p: 4,
                    minWidth: 400,
                }}
            >
                <Typography variant="h6" mb={2}>
                    {title}
                </Typography>
                {message && (
                    <Typography variant="body1" mb={3}>
                        {message}
                    </Typography>
                )}

                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverRoundedIcon />}
                        fullWidth
                        onClick={() => {
                            onConfirm();
                        }}
                        sx={{
                            borderRadius: "20px",
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: 16,
                            height: "50px",
                        }}
                    >
                        Удалить
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleClose}
                        sx={{
                            borderRadius: "20px",
                            fontSize: 16,
                            height: "50px",
                            textTransform: "none",
                        }}
                    >
                        Отмена
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
