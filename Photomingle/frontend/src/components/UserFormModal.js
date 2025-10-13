import React, { useRef, useState, useEffect } from "react";
import {
    Box,
    Button,
    Modal,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    IconButton
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddAPhotoRoundedIcon from "@mui/icons-material/AddAPhotoRounded";
import {useCreateUserMutation, useEditUserMutation} from "../services/usersApi";

export default function UserFormModal({ open, handleClose, user, admin=false }) {
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(user?.role === "admin" || false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
    const fileInputRef = useRef(null);
    const isEdit = !!user;

    console.log(user);

    const [createUser] = useCreateUserMutation();
    const [updateUser] = useEditUserMutation();

    const selectImage = (files) => {
        const file = Array.from(files).find(f => f.type?.startsWith("image/"));
        if (!file) return;
        if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const onFileInputChange = (e) => selectImage(e.target.files);
    const onClickDropzone = () => fileInputRef.current?.click();

    const clearAvatar = () => {
        if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const [dragActive, setDragActive] = useState(false);


    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        selectImage(e.dataTransfer.files);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        setDragActive(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };


    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const handleSubmit = async () => {
        if (!email.trim() || (!isEdit && !password.trim())) {
            alert("Пожалуйста, заполните email и пароль");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("is_staff", isAdmin.toString());

            if (!isEdit || password.trim()) {
                formData.append("password", password);
            }

            if (avatarFile) formData.append("avatar", avatarFile);

            if (isEdit) {
                formData.append("id", user.id);
                await updateUser(formData).unwrap();
            } else {
                await createUser(formData).unwrap();
            }

            handleClose(true);
        } catch (err) {
            console.error("Ошибка при сохранении пользователя:", err);
            alert("Ошибка при сохранении пользователя");
        }
    };

    return (
        <Modal open={open} onClose={() => handleClose(false)}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "#fff",
                    borderRadius: 7,
                    boxShadow: 3,
                    p: 4,
                    minWidth: 500
                }}
            >
                <Typography variant="h6" mb={3}>
                    {isEdit ? "Редактировать пользователя" : "Создать пользователя"}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 3 }}>
                    {/* Аватар */}
                    <Box
                        onClick={onClickDropzone}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        role="button"
                        aria-label="Загрузить аватар"
                        sx={{
                            position: "relative",
                            width: 140,
                            height: 140,
                            borderRadius: "50%",
                            overflow: "hidden",
                            cursor: "pointer",
                            border: "2px solid",
                            borderColor: dragActive ? "primary.main" : "rgba(0,0,0,0.15)",
                            "&:hover": { borderColor: "primary.main" },
                        }}
                    >
                        {avatarPreview && (
                            <Box
                                component="img"
                                src={avatarPreview}
                                alt="Аватар"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    filter: "brightness(0.6)",
                                }}
                            />
                        )}
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "grid",
                                placeItems: "center",
                                pointerEvents: "none",
                            }}
                        >
                            <AddAPhotoRoundedIcon
                                sx={{
                                    fontSize: 40,
                                    color: avatarPreview ? "#fff" : "rgba(0,0,0,0.4)",
                                }}
                            />
                        </Box>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={onFileInputChange}
                        />
                    </Box>

                    {/* Поля */}
                    <Box sx={{ flex: 1 }}>
                        <TextField
                            label="Email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText={isEdit ? "Оставьте пустым, чтобы не менять пароль" : ""}
                            sx={{ mb: 2 }}
                        />
                        {admin && (<FormControlLabel
                            control={<Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />}
                            label="Администратор"
                        />)}
                    </Box>
                </Box>

                {/* Кнопки */}
                <Box display="flex" gap={2}>
                    <Button variant="contained" startIcon={<AddRoundedIcon />} fullWidth onClick={handleSubmit}>
                        {isEdit ? "Сохранить" : "Создать"}
                    </Button>
                    <Button variant="outlined" fullWidth onClick={() => handleClose(false)}>Отмена</Button>
                </Box>
            </Box>
        </Modal>
    );
}
