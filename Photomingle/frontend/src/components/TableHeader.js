import React from "react";
import { Box, IconButton, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

interface TableHeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onAdd?: () => void; // функция добавления нового элемента
}

const TableHeader: React.FC<TableHeaderProps> = ({ searchValue, onSearchChange, onAdd }) => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
                p: 1.5,
                bgcolor: "#f5f5f5",
                borderRadius: 3,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
        >
            {/* Стрелка назад */}
            <Box sx={{ flex: "0 0 50px", mr: 2 }}>
                <IconButton
                    onClick={() => navigate("/admin")}
                    sx={{
                        bgcolor: "#fff",
                        "&:hover": {
                            bgcolor: "#1976d2",
                            color: "#fff",
                            transform: "scale(1.1)",
                            transition: "all 0.2s",
                        },
                        transition: "all 0.2s",
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
            </Box>

            {/* Плюсик для добавления */}
            {onAdd && (
                <Box sx={{ flex: "0 0 50px", mr: 2 }}>
                    <IconButton
                        onClick={onAdd}
                        sx={{
                            bgcolor: "#fff",
                            "&:hover": {
                                bgcolor: "#1976d2",
                                color: "#fff",
                                transform: "scale(1.1)",
                                transition: "all 0.2s",
                            },
                            transition: "all 0.2s",
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Box>
            )}

            {/* Поле поиска */}
            <Box sx={{ flex: 1 }}>
                <TextField
                    fullWidth
                    size="medium"
                    placeholder="Поиск..."
                    variant="outlined"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    sx={{
                        bgcolor: "#fff",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                                borderColor: "#1976d2",
                                boxShadow: "0 0 8px rgba(25,118,210,0.3)",
                            },
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default TableHeader;
