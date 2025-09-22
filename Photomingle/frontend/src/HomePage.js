import React from "react";
import { Box, Typography } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveAppBar";


export default function HomePage() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Хедер */}
            <ResponsiveAppBar />
            {/* Контент */}
            <Box sx={{ p: 5, textAlign: "center" }}>
                <Typography variant="h3" gutterBottom>
                    Добро пожаловать в Photomingle 🎉
                </Typography>
                <Typography variant="h6">
                    Заказывайте печать фото онлайн быстро и удобно.
                </Typography>
            </Box>
        </Box>
    );
}