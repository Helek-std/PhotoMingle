import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
      try {
        const response = await fetch(`/api/orders/${orderId}/`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image_id: imageId }),
        });

        if (!response.ok) throw new Error('Ошибка при удалении');

        fetchOrderDetails(); // Обновить список после удаления
      } catch (err) {
        console.error('Ошибка удаления изображения:', err);
      }
    };


  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!newImage) return;

    const formData = new FormData();
    formData.append('file', newImage);

    try {
      const response = await fetch(`/api/orders/${orderId}/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Ошибка при загрузке');

      // Обновляем заказ после добавления изображения
      fetchOrderDetails();
      setNewImage(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!order) return <p>Заказ не найден.</p>;

  return (
    <div>
      <h2>Заказ: {order.name}</h2>
      <p><strong>ID:</strong> {order.id}</p>
      <p><strong>Статус:</strong> {order.status}</p>

      <h3>Изображения</h3>
        {order.images && order.images.length > 0 ? (
          <ul>
            {order.images.map((img) => (
              <li key={img.id} style={{ marginBottom: '10px' }}>
                <img src={img.preview || img.file} alt="Preview" width={120} />
                <br />
                <button onClick={() => handleDeleteImage(img.id)} style={{ color: 'red' }}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет изображений</p>
        )}

      <h4>Добавить изображение</h4>
      <form onSubmit={handleImageUpload}>
        <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
        <button type="submit">Загрузить</button>
      </form>
    </div>
  );
};

export default OrderDetailPage;
