import React, { useEffect, useState } from "react";

const MyOrders = () => {
  const [email, setEmail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      fetch("http://localhost:8000/myorders/", {
        method: "GET",
        headers: {
           "Authorization": `Bearer ${token}`,  // Отправляем токен в другом заголовке
        },
         mode: "cors",  // Для разрешения CORS
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Unauthorized");
          }
        })
        .then((data) => {
          setEmail(data.email);  // Сохраняем почту пользователя
        })
        .catch((error) => {
          setError("Пользователь не авторизован");
        });
    } else {
      setError("Пользователь не авторизован");
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {email ? (
        <h2>Почта пользователя: {email}</h2>
      ) : (
        <h2>{error}</h2>
      )}
    </div>
  );
};

export default MyOrders;
