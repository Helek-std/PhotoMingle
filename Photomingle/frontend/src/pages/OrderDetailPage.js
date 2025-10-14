import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import {useCompleteOrderMutation, useDeleteOrderImageMutation, useGetOrderByIdQuery} from "../services/ordersApi";


const STATUS_TRANSLATIONS = {
    in_work: "В работе",
    in_creation: "Создается",
    ready: "Готов",
};

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const { data: order, error, isLoading } = useGetOrderByIdQuery(orderId);
    const [deleteImage] = useDeleteOrderImageMutation();
    const [completeOrder] = useCompleteOrderMutation();

    const handleDeleteImage = async (imageId) => {
        try {
            await deleteImage({ orderId, imageId }).unwrap();
        } catch (err) {
            console.error("Ошибка при удалении изображения:", err);
        }
    };

    const goToAddImagePage = () => {
        navigate(`/orders/${orderId}/addImage`);
    };

    const handleCompleteOrder = async () => {
        try {
            await completeOrder(orderId).unwrap();
        } catch (err) {
            console.error("Ошибка при завершении заказа:", err);
        }
    };

    return (
        <Box sx={{ backgroundColor: "#fafafa", minHeight: "100vh", p: 5, color: "#333" }}>
            <Box sx={{ maxWidth: "900px", margin: "0 auto" }}>
                <Box sx={{ textAlign: "left", mb: 2.5 }}>
                    <Button
                        component={Link}
                        to="/orders"
                        variant="outlined"
                        sx={{
                            px: 3,
                            py: 1,
                            backgroundColor: "#fff",
                            color: "#333",
                            textDecoration: "none",
                            borderRadius: 3,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "1px solid #e0e0e0",
                            textTransform: "none",
                            fontSize: "1rem",
                            "&:hover": {
                                backgroundColor: "#f5f5f5",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                            },
                        }}
                    >
                        Назад к списку заказов
                    </Button>
                </Box>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            textAlign: "center",
                            mb: 3.75,
                            color: "primary.main",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                        }}
                    >
                        Детали заказа
                    </Typography>
                </motion.div>

                {isLoading ? (
                    <Typography sx={{ textAlign: "center" }}>Загрузка данных...</Typography>
                ) : error ? (
                    <Typography sx={{ color: "error.main", textAlign: "center" }}>
                        Ошибка загрузки данных
                    </Typography>
                ) : !order ? (
                    <Typography sx={{ textAlign: "center" }}>Заказ не найден</Typography>
                ) : (
                    <>
                        <Card
                            sx={{
                                backgroundColor: "white",
                                borderRadius: 3,
                                p: 2.5,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                mb: 3.75,
                                transition: "transform 0.2s, box-shadow 0.2s",
                                "&:hover": {
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                                },
                            }}
                        >
                            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                                <Typography variant="h5" sx={{ mt: 0, mb: 1.5, fontWeight: 600 }}>
                                    {order.name}
                                </Typography>
                                <Typography sx={{ mb: 1 }}>
                                    <strong>Ссылка для приглашения:</strong>{" "}
                                    <Box
                                        component="span"
                                        onClick={() => {
                                            const fullUrl = `${window.location.origin}/orders/invite/${order.shortcut_url}`;
                                            navigator.clipboard.writeText(fullUrl);
                                            alert("Ссылка скопирована в буфер обмена");
                                        }}
                                        sx={{
                                            color: "primary.main",
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                            "&:hover": {
                                                color: "primary.dark",
                                            },
                                        }}
                                    >
                                        {`${window.location.origin}/orders/invite/${order.shortcut_url}`}
                                    </Box>
                                </Typography>
                                <Typography sx={{ mb: 1 }}>
                                    <strong>Статус:</strong>{" "}
                                    {STATUS_TRANSLATIONS[order.status] || order.status}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: "1.25rem",
                                        mt: 1.25,
                                        color: "#333",
                                        fontWeight: 600,
                                    }}
                                >
                                    <strong>Общая стоимость:</strong> {order.total_price} ₽
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card
                            sx={{
                                backgroundColor: "#f9f9f9",
                                borderRadius: 3,
                                p: 2.5,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                border: "1px solid #e0e0e0",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 1.875, color: "#333", fontWeight: 600 }}>
                                Изображения
                            </Typography>

                            {order.images && order.images.length > 0 ? (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
                                    {order.images.map((img) => (
                                        <Card
                                            key={img.id}
                                            sx={{
                                                border: "1px solid #e0e0e0",
                                                borderRadius: 2,
                                                p: 1.25,
                                                width: "140px",
                                                textAlign: "center",
                                                backgroundColor: "#fff",
                                                transition: "transform 0.2s",
                                                "&:hover": {
                                                    transform: "translateY(-2px)",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                },
                                            }}
                                        >
                                            <img
                                                src={img.preview || img.file}
                                                alt="Preview"
                                                style={{
                                                    width: "100%",
                                                    borderRadius: "8px",
                                                    height: "100px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                            {order.status !== "in_work" && (
                                                <Button
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    sx={{
                                                        mt: 1.25,
                                                        color: "white",
                                                        backgroundColor: "error.main",
                                                        border: "none",
                                                        px: 1.25,
                                                        py: 0.625,
                                                        borderRadius: 2,
                                                        cursor: "pointer",
                                                        textTransform: "none",
                                                        fontSize: "0.875rem",
                                                        "&:hover": {
                                                            backgroundColor: "error.dark",
                                                        },
                                                    }}
                                                >
                                                    Удалить
                                                </Button>
                                            )}
                                        </Card>
                                    ))}
                                </Box>
                            ) : (
                                <Typography>Нет изображений</Typography>
                            )}

                            <Box sx={{ mt: 3.75, textAlign: "center" }}>
                                <Button
                                    onClick={goToAddImagePage}
                                    disabled={order.status === "in_work"}
                                    variant="contained"
                                    sx={{
                                        backgroundColor:
                                            order.status === "in_work" ? "grey.400" : "primary.main",
                                        color: "white",
                                        px: 2.5,
                                        py: 1.25,
                                        border: "none",
                                        borderRadius: 2,
                                        cursor: order.status === "in_work" ? "not-allowed" : "pointer",
                                        fontSize: "1rem",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        mr: 1.25,
                                        textTransform: "none",
                                        "&:hover": {
                                            backgroundColor:
                                                order.status === "in_work" ? "grey.400" : "primary.dark",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                        },
                                    }}
                                >
                                    + Добавить изображение
                                </Button>

                                <Button
                                    onClick={handleCompleteOrder}
                                    disabled={order.status === "in_work"}
                                    variant="contained"
                                    sx={{
                                        backgroundColor:
                                            order.status === "in_work" ? "grey.400" : "secondary.main",
                                        color: "white",
                                        px: 2.5,
                                        py: 1.25,
                                        border: "none",
                                        borderRadius: 2,
                                        cursor: order.status === "in_work" ? "not-allowed" : "pointer",
                                        fontSize: "1rem",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        textTransform: "none",
                                        "&:hover": {
                                            backgroundColor:
                                                order.status === "in_work" ? "grey.400" : "secondary.dark",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                        },
                                    }}
                                >
                                    Завершить заказ
                                </Button>
                            </Box>
                        </Card>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default OrderDetailPage;