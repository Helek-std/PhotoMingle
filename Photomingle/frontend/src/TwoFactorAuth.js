import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const TwoFactorAuth = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email; // Получаем email из state
  if (!email) {
    navigate("/login"); // Если email нет, редиректим на логин
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/2fa/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        navigate("/myorders");
      } else {
        setError(data.error || "Неверный код!");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером!");
    }
  };


  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Двухфакторная аутентификация
        </h2>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          На вашу почту был отправлен код для подтверждения
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="code" style={{ display: "block", marginBottom: "5px" }}>
              Введите код
            </label>
            <input
              id="code"
              type="text"
              placeholder="Введите код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
                textAlign: "center",
                letterSpacing: "3px",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Подтвердить
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/login" style={{ color: "#4CAF50", textDecoration: "none" }}>
            Назад
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
