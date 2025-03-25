import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Очистка токенов
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Запрос на сервер для выхода (необязательно, но можно добавить)
    fetch("/api/logout/", {
      method: "GET", // Можно оставить POST, если на бэке останется POST
      credentials: "include",
    }).finally(() => {
      setTimeout(() => navigate("/"), 2000); // Перенаправление на главную через 2 секунды
    });
  }, [navigate]);

  return <h2>Вы вышли из аккаунта</h2>;
};

export default Logout;
