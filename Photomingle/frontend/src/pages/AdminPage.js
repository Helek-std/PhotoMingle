import React from "react";
import {
    Box,
    Typography,
    Card,
    Grid,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ResponsiveAppBar from "../components/ResponsiveAppBar";
import { motion } from "framer-motion";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {useGetMonitorStatsQuery} from "../services/ordersApi";

interface GaugeProps {
    value: number; // 0..1
    label: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, label }) => {
    const radius = 100;
    const stroke = 14;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * Math.PI * 2;
    const offset = circumference - value * circumference;

    const getColor = (v: number) => {
        if (v < 0.3) return "#4caf50";
        if (v < 0.7) return "#ff9800";
        return "#f44336";
    };

    return (
        <Box sx={{ textAlign: "center", position: "relative" }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: "#333" }}>
                {label}
            </Typography>
            <svg height={radius * 2} width={radius * 2}>
                <circle
                    stroke="#e0e0e0"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <motion.circle
                    stroke={getColor(value)}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                />
                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="28"
                    fontWeight="700"
                    fill="#333"
                >
                    {(value * 100).toFixed(0)}%
                </text>
                <text
                    x="50%"
                    y="65%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#777"
                >
                    Нагрузка
                </text>
            </svg>
        </Box>
    );
};

export default function AdminDashboard() {
    const navigate = useNavigate();

    const { data, isLoading, isError } = useGetMonitorStatsQuery(undefined, {
        pollingInterval: 5000,
    });

    const cpuLoad = (data?.cpu?.percent ?? 0) / 100;
    const ramLoad = (data?.ram?.percent ?? 0) / 100;
    const diskLoad = (data?.disk?.percent ?? 0) / 100;
    const processes = data?.processes ?? [];

    const menuItems = [
        {
            icon: <PeopleAltIcon sx={{ fontSize: 80 }} />,
            label: "Пользователи",
            path: "/admin/users",
        },
        {
            icon: <PriceChangeIcon sx={{ fontSize: 80 }} />,
            label: "Прайсы",
            path: "/admin/prices",
        },
        {
            icon: <ShoppingCartIcon sx={{ fontSize: 80 }} />,
            label: "Заказы",
            path: "/admin/orders",
        },
    ];

    if (isLoading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );

    if (isError)
        return (
            <Box sx={{ textAlign: "center", mt: 10, color: "red" }}>
                Ошибка загрузки данных мониторинга
            </Box>
        );

    return (
        <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "#fafafa" }}>
            <ResponsiveAppBar />

            <Box
                sx={{
                    maxWidth: 1400,
                    mx: "auto",
                    px: 4,
                    pt: 6,
                    pb: 8,
                    background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
                }}
            >
                {/* Иконки-меню */}
                <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
                    {menuItems.map((item, i) => (
                        <Grid item key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                            >
                                <Card
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        cursor: "pointer",
                                        textAlign: "center",
                                        borderRadius: 4,
                                        p: 3,
                                        bgcolor: "#111",
                                        color: "#fff",
                                        width: 220,
                                        height: 220,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        "&:hover": {
                                            boxShadow: "0 0 18px rgba(0,0,0,0.25)",
                                            transform: "translateY(-4px)",
                                        },
                                        transition: "all 0.25s",
                                    }}
                                >
                                    <IconButton
                                        sx={{
                                            color: "#fff",
                                            mb: 1,
                                            pointerEvents: "none",
                                            fontSize: 80,
                                        }}
                                    >
                                        {item.icon}
                                    </IconButton>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {item.label}
                                    </Typography>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Чарты загрузки */}
                <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={8} sx={paperStyle}>
                            <Gauge value={cpuLoad} label="Загрузка ЦП" />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper elevation={8} sx={paperStyle}>
                            <Gauge value={ramLoad} label="Загрузка ОЗУ" />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper elevation={8} sx={paperStyle}>
                            <Gauge value={diskLoad} label="Загрузка Диска" />
                        </Paper>
                    </Grid>
                </Grid>

                {/* Таблица процессов */}
                <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto" }}>
                    <Paper elevation={8} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#111" }}>
                                <TableRow>
                                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                                        Процесс
                                    </TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                                        CPU (%)
                                    </TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                                        RAM (%)
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processes.map((proc: any, idx: number) => (
                                    <TableRow
                                        key={idx}
                                        sx={{
                                            "&:hover": { backgroundColor: "#f5f5f5" },
                                        }}
                                    >
                                        <TableCell>{proc.name}</TableCell>
                                        <TableCell>{proc.cpu_percent}</TableCell>
                                        <TableCell>
                                            {proc.memory_percent?.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}

const paperStyle = {
    p: 4,
    textAlign: "center",
    borderRadius: 4,
    backgroundColor: "#fff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    "&:hover": {
        boxShadow: "0 6px 25px rgba(0,0,0,0.12)",
    },
    transition: "box-shadow 0.3s ease",
};
