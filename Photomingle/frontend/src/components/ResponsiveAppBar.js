import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import { useLogoutMutation, useMyInfoQuery } from '../services/usersApi';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate } from 'react-router-dom';
import {useState} from "react";

const GlitchText = styled(motion.div)(({ theme }) => ({
    position: 'relative',
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    animation: 'glitch 2s infinite',
    '@keyframes glitch': {
        '0%': { textShadow: '2px 0 red, -2px 0 blue' },
        '20%': { textShadow: '-2px 0 red, 2px 0 blue' },
        '40%': { textShadow: '2px 2px red, -2px -2px blue' },
        '60%': { textShadow: '-2px -2px red, 2px 2px blue' },
        '80%': { textShadow: '2px -2px red, -2px 2px blue' },
        '100%': { textShadow: '2px 0 red, -2px 0 blue' },
    },
}));

export default function ResponsiveAppBar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const { data: user, error, isLoading, refetch } = useMyInfoQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [logout] = useLogoutMutation();

    const settings = ['Профиль', 'Выход'];
    const settingsActions = [
        () => navigate('/profile'),
        async () => {
            try {
                await logout({ all: false }).unwrap();
                refetch();
            } catch (e) {
                console.error('Ошибка при выходе', e);
            }
        },
    ];

    const pages = React.useMemo(() => {
        const basePages = [{ name: 'Главная', path: '/' }];
        if (user && !error) {
            basePages.push({ name: 'Мои заказы', path: '/orders' });
            if (user.is_staff || user.is_admin || user.role === 'admin') {
                basePages.push({ name: 'Админ-панель', path: '/admin' });
            }
        }
        return basePages;
    }, [user, error]);

    const pathToPageMap = Object.fromEntries(pages.map(p => [p.path, p.name]));
    const currentPage = pathToPageMap[location.pathname] || 'Главная';
    const [selected, setSelected] = React.useState(currentPage);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = (page?: string) => {
        if (page) {
            setSelected(page);
            const targetPage = pages.find(p => p.name === page);
            if (targetPage) navigate(targetPage.path);
        }
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static" sx={{ background: '#111', width: '100%' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <GlitchText style={{ marginRight: '16px', display: 'flex' }}>Photomingle</GlitchText>

                    {/* Mobile */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorElNav)}
                            onClose={() => handleCloseNavMenu()}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {pages.map(page => (
                                <MenuItem key={page.name} onClick={() => handleCloseNavMenu(page.name)}>
                                    <Typography textAlign="center">{page.name}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {/* Desktop */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map(page => (
                            <Button
                                key={page.name}
                                onClick={() => handleCloseNavMenu(page.name)}
                                sx={{
                                    my: 2,
                                    color: selected === page.name ? 'primary.main' : 'white',
                                    fontWeight: selected === page.name ? 'bold' : 'normal',
                                    display: 'block',
                                    fontSize: '1.1rem',
                                }}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </Box>

                    {/* User block */}
                    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user && !error ? (
                            <>
                                <Typography variant="body2">{user.email}</Typography>
                                <Tooltip title="Открыть настройки">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        {user.avatar ? (
                                            <Avatar alt="User Avatar" src={user.avatar} />
                                        ) : (
                                            <Avatar>
                                                <PersonIcon />
                                            </Avatar>
                                        )}
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar-user"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settings.map((setting, index) => (
                                        <MenuItem
                                            key={setting}
                                            onClick={() => {
                                                handleCloseUserMenu();
                                                settingsActions[index]();
                                            }}
                                        >
                                            <Typography textAlign="center">{setting}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        ) : (
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => navigate('/login')}
                            >
                                Войти
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
