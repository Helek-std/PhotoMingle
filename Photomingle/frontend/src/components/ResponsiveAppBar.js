import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import PersonIcon from "@mui/icons-material/Person";
import { motion } from "framer-motion";
import { styled } from "@mui/system";
import { useLogoutMutation, useMyInfoQuery } from "../services/usersApi";
import { useLocation, useNavigate } from "react-router-dom";
import UserFormModal from "./UserFormModal"; // ✅ Добавляем импорт

const GlitchText = styled(motion.div)({
    position: "relative",
    color: "#fff",
    fontSize: "1.5rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "2px",
    animation: "glitch 2s infinite",
    "@keyframes glitch": {
        "0%": { textShadow: "2px 0 red, -2px 0 blue" },
        "20%": { textShadow: "-2px 0 red, 2px 0 blue" },
        "40%": { textShadow: "2px 2px red, -2px -2px blue" },
        "60%": { textShadow: "-2px -2px red, 2px 2px blue" },
        "80%": { textShadow: "2px -2px red, -2px 2px blue" },
        "100%": { textShadow: "2px 0 red, -2px 0 blue" },
    },
});

export default function ResponsiveAppBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const { data: user, error, isLoading, refetch } = useMyInfoQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [logout] = useLogoutMutation();
    const [showUserModal, setShowUserModal] = useState(false);

    const pages = React.useMemo(() => {
        const basePages = [{ name: "Главная", path: "/" }];
        if (user && !error) {
            basePages.push({ name: "Мои заказы", path: "/orders" });
            if (user.is_staff || user.is_admin || user.role === "admin") {
                basePages.push({ name: "Админ-панель", path: "/admin" });
            }
        }
        return basePages;
    }, [user, error]);

    const settings = ["Профиль", "Выход"];

    const handleSettingClick = async (setting: string) => {
        if (setting === "Профиль") {
            setShowUserModal(true); // ✅ открываем модалку
        } else if (setting === "Выход") {
            try {
                await logout({ all: false }).unwrap();
                refetch();
            } catch (e) {
                console.error("Ошибка при выходе", e);
            }
        }
        setAnchorElUser(null);
    };

    return (
        <>
            <AppBar position="static" sx={{ background: "#111", width: "100%" }}>
                <Container maxWidth="xl">
                    <Toolbar
                        disableGutters
                        sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                        <GlitchText style={{ marginRight: "16px" }}>Photomingle</GlitchText>

                        {/* Навигация */}
                        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                            {pages.map((page) => (
                                <Button
                                    key={page.name}
                                    onClick={() => navigate(page.path)}
                                    sx={{
                                        my: 2,
                                        color: location.pathname === page.path ? "primary.main" : "white",
                                        fontWeight:
                                            location.pathname === page.path ? "bold" : "normal",
                                        fontSize: "1.1rem",
                                    }}
                                >
                                    {page.name}
                                </Button>
                            ))}
                        </Box>

                        {/* Блок пользователя */}
                        <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 1 }}>
                            {user && !error ? (
                                <>
                                    <Typography variant="body2">{user.email}</Typography>
                                    <Tooltip title="Открыть настройки">
                                        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                                            {user.avatar ? (
                                                <Avatar src={user.avatar} />
                                            ) : (
                                                <Avatar>
                                                    <PersonIcon />
                                                </Avatar>
                                            )}
                                        </IconButton>
                                    </Tooltip>

                                    <Menu
                                        sx={{ mt: "45px" }}
                                        id="menu-appbar-user"
                                        anchorEl={anchorElUser}
                                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                        keepMounted
                                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                                        open={Boolean(anchorElUser)}
                                        onClose={() => setAnchorElUser(null)}
                                    >
                                        {settings.map((setting) => (
                                            <MenuItem key={setting} onClick={() => handleSettingClick(setting)}>
                                                <Typography textAlign="center">{setting}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            ) : (
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => navigate("/login")}
                                >
                                    Войти
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {user && (
                <UserFormModal
                    open={showUserModal}
                    handleClose={() => setShowUserModal(false)}
                    user={user}
                />
            )}
        </>
    );
}
