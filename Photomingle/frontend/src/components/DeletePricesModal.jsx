import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

export default function DeletePriceModal({ open, onClose, onConfirm, item }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Удалить цену</DialogTitle>
            <DialogContent>
                <Typography>
                    Вы уверены, что хотите удалить{" "}
                    <strong>{item?.name}</strong>?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button color="error" variant="contained" onClick={() => onConfirm(item)}>
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
}
