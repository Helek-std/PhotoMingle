import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import {useJoinOrderByInviteMutation} from "../services/ordersApi";

export default function InvitePage() {
    const { shortcut_url } = useParams();
    const navigate = useNavigate();
    const [joinOrder, { isLoading, isError, error }] = useJoinOrderByInviteMutation();

    useEffect(() => {
        if (!shortcut_url) return;

        const handleJoin = async () => {
            try {
                const response = await joinOrder(shortcut_url).unwrap();
                if (response?.order_id) {
                    navigate(`/orders/${response.order_id}`);
                } else {
                    navigate("/orders");
                }
            } catch (err) {
                if (err?.status === 401) {
                    navigate("/login");
                } else {
                    console.error("Ошибка при добавлении в заказ:", err);
                }
            }
        };

        handleJoin();
    }, [shortcut_url, joinOrder, navigate]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#fafafa",
            }}
        >
            {isLoading ? (
                <>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Добавление в заказ...</Typography>
                </>
            ) : isError ? (
                <Typography color="error">
                    Ошибка при добавлении: {error?.data?.detail || "Не удалось выполнить запрос"}
                </Typography>
            ) : null}
        </Box>
    );
}
