import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
        <div style={{ backgroundColor: "#fff", minHeight: "100vh", padding: "40px", color: "#333" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                <div style={{ textAlign: "left", marginBottom: "20px" }}>
                    <Link
                        to="/orders"
                        style={{
                            padding: "10px 15px",
                            backgroundColor: "#e0e0e0",
                            color: "#333",
                            textDecoration: "none",
                            borderRadius: "4px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                    >
                        Назад к списку заказов
                    </Link>
                </div>

                <h2
                    style={{
                        textAlign: "center",
                        fontSize: "2rem",
                        marginBottom: "30px",
                        color: "#4CAF50",
                    }}
                >
                    Детали заказа
                </h2>

                {isLoading ? (
                    <p style={{ textAlign: "center" }}>Загрузка данных...</p>
                ) : error ? (
                    <p style={{ color: "red", textAlign: "center" }}>Ошибка загрузки данных</p>
                ) : !order ? (
                    <p style={{ textAlign: "center" }}>Заказ не найден</p>
                ) : (
                    <>
                        <div
                            style={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                padding: "20px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                marginBottom: "30px",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>{order.name}</h3>
                            <p>
                                <strong>Ссылка для приглашения:</strong>{" "}
                                <span
                                    onClick={() => {
                                        const fullUrl = `${window.location.origin}/orders/invite/${order.shortcut_url}`;
                                        navigator.clipboard.writeText(fullUrl);
                                        alert("Ссылка скопирована в буфер обмена");
                                    }}
                                    style={{
                                        color: "#4CAF50",
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                    }}
                                >
                  {`${window.location.origin}/orders/invite/${order.shortcut_url}`}
                </span>
                            </p>
                            <p>
                                <strong>Статус:</strong>{" "}
                                {STATUS_TRANSLATIONS[order.status] || order.status}
                            </p>
                            <p style={{ fontSize: "1.2rem", marginTop: "10px", color: "#333" }}>
                                <strong>Общая стоимость:</strong> {order.total_price} ₽
                            </p>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#f9f9f9",
                                borderRadius: "8px",
                                padding: "20px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            }}
                        >
                            <h4 style={{ marginBottom: "15px", color: "#333" }}>Изображения</h4>

                            {order.images && order.images.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                                    {order.images.map((img) => (
                                        <div
                                            key={img.id}
                                            style={{
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                padding: "10px",
                                                width: "140px",
                                                textAlign: "center",
                                                backgroundColor: "#fff",
                                            }}
                                        >
                                            <img
                                                src={img.preview || img.file}
                                                alt="Preview"
                                                style={{ width: "100%", borderRadius: "4px" }}
                                            />
                                            {order.status !== "in_work" && (
                                                <button
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    style={{
                                                        marginTop: "10px",
                                                        color: "white",
                                                        backgroundColor: "#f44336",
                                                        border: "none",
                                                        padding: "5px 10px",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Удалить
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Нет изображений</p>
                            )}

                            <div style={{ marginTop: "30px", textAlign: "center" }}>
                                <button
                                    onClick={goToAddImagePage}
                                    disabled={order.status === "in_work"}
                                    style={{
                                        backgroundColor: order.status === "in_work" ? "#ccc" : "#4CAF50",
                                        color: "white",
                                        padding: "10px 20px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: order.status === "in_work" ? "not-allowed" : "pointer",
                                        fontSize: "16px",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                        marginRight: "10px",
                                    }}
                                >
                                    + Добавить изображение
                                </button>

                                <button
                                    onClick={handleCompleteOrder}
                                    disabled={order.status === "in_work"}
                                    style={{
                                        backgroundColor: order.status === "in_work" ? "#ccc" : "#2196F3",
                                        color: "white",
                                        padding: "10px 20px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: order.status === "in_work" ? "not-allowed" : "pointer",
                                        fontSize: "16px",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                    }}
                                >
                                    Завершить заказ
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;
