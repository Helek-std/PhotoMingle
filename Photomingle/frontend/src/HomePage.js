import React, { useState } from "react";
import {Box, Typography, Button, Card, CardContent, Grid, Paper, Rating} from "@mui/material";
import ResponsiveAppBar from "./ResponsiveAppBar";
import InfiniteScroll from "./components/InfiniteScroll";
import {useNavigate} from "react-router-dom";
import { motion } from "framer-motion";
import {useGetPrintFormatsQuery} from "./services/ordersApi";
const generateReviewItems = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        content: (
            <Paper
                elevation={6}
                sx={{
                    bgcolor: '#111',
                    color: '#fff',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 1,
                }}
            >
                <Typography sx={{ mb: 0.5, fontWeight: 600 }}>Пользователь {i + 1}</Typography>
                <Rating value={5} readOnly size="small" sx={{ mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.9rem', textAlign: 'center' }}>
                    Отличный сервис! Очень доволен результатом. Печать качественная и быстрая.
                </Typography>
            </Paper>
        ),
    }));
};

function PrintFormatsList() {
    const { data: formats, isLoading, isError } = useGetPrintFormatsQuery();
    console.log(formats);
    if (isLoading) return <Typography sx={{color:"white"}}>Загрузка...</Typography>;
    if (isError) return <Typography sx={{color:"white"}}>Ошибка при загрузке форматов</Typography>;
    if (!formats || formats.length === 0)
        return <Typography>Форматы печати отсутствуют</Typography>;

    return (
        <Box>
            {formats.map((item) => (
                <Card
                    key={item.id}
                    sx={{
                        my: 1,
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        },
                    }}
                >
                    <CardContent
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            px: 3,
                            py: 2,
                        }}
                    >
                        <Typography variant="h6">{`${item.width_mm}x${item.height_mm} мм`}</Typography>
                        <Typography variant="h6" color="primary">
                            {`${item.price} ₽`}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const items = generateReviewItems(10);

    const handleOrderClick = () => {
        navigate("/orders");
    };

    return (
        <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "#fafafa" }}>
            <ResponsiveAppBar />

            <Box
                component="main"
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    height: "calc(100vh - 64px)",
                    width: "100%",
                    background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
                    overflow: "hidden", // чтобы не было белых полос
                }}
            >
                {/* Левая половина */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 4,
                        position: "relative",
                        overflow: "hidden",
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=60')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        style={{ width: "100%", maxWidth: 420 }}
                    >
                        <Typography
                            variant="h4"
                            gutterBottom
                            textAlign="center"
                            color="white"
                            sx={{
                                textShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
                                letterSpacing: "0.5px",
                                fontWeight: 600,
                            }}
                        >
                            Форматы печати
                        </Typography>

                        <PrintFormatsList />

                        <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleOrderClick}
                                sx={{
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    fontSize: "1.05rem",
                                    textTransform: "none",
                                }}
                            >
                                Сделать заказ
                            </Button>
                        </Box>
                    </motion.div>
                </Box>

                {/* Правая половина */}
                <Box
                    sx={{
                        flex: 1, // ✅ равная ширина и высота
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        backgroundColor: "#f0f2f5",
                        p: 3,
                    }}
                >
                    <Box
                        sx={{
                            flex: "0 0 8%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="h4" gutterBottom textAlign="center">
                            Отзывы наших пользователей
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            flex: "1 1 auto",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <InfiniteScroll
                            items={items}
                            width="100%"
                            maxHeight={"100%"}
                            itemMinHeight={80}
                            negativeMargin={-6}
                            autoplay
                            autoplaySpeed={0.3}
                            pauseOnHover={false}
                            isTilted
                            tiltDirection="left"
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}