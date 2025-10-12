import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
} from "@mui/material";

export default function PriceModal({ open, onClose, onSubmit, initialData }) {
    const isEdit = Boolean(initialData);
    const [form, setForm] = useState({
        name: "",
        width_mm: "",
        height_mm: "",
        price: "",
    });

    useEffect(() => {
        if (initialData) setForm(initialData);
        else
            setForm({
                name: "",
                width_mm: "",
                height_mm: "",
                price: "",
            });
    }, [initialData]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onSubmit(form);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {isEdit ? "Редактировать цену" : "Добавить новую цену"}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                        label="Название"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="Ширина (мм)"
                        name="width_mm"
                        value={form.width_mm}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                    />
                    <TextField
                        label="Длина (мм)"
                        name="height_mm"
                        value={form.height_mm}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                    />
                    <TextField
                        label="Цена"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    {isEdit ? "Сохранить" : "Добавить"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
