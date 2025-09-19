import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useLogoutMutation} from "./services/usersApi";

const Logout = () => {
    const navigate = useNavigate();
    const [logout] = useLogoutMutation();

    useEffect(() => {
        const doLogout = async () => {
            try {
                await logout().unwrap();
            } catch (err) {
                console.error("Ошибка при logout:", err);
            } finally {
                setTimeout(() => navigate("/"), 1500);
            }
        };

        doLogout();
    }, [logout, navigate]);

    return <h2>Вы вышли из аккаунта...</h2>;
};

export default Logout;
