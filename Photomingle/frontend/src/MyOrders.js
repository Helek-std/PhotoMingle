import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Токен не найден. Пожалуйста, войдите в систему.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Ошибка ${response.status}`);
      const data = await response.json();

      const combined = data.order_ids.map((id, index) => ({
        id,
        name: data.order_names[index],
      }));

      setOrders(combined);
    } catch (err) {
      setError(`Не удалось загрузить заказы: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async () => {
    if (!newName.trim()) {
      alert('Введите название заказа');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Вы не авторизованы!');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/orders/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Ошибка ${response.status}`);
      }

      setNewName('');
      setShowCreateForm(false);
      await fetchOrders();
    } catch (err) {
      alert(`Ошибка при создании заказа: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2>Мои заказы</h2>

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Отменить' : 'Создать заказ'}
      </button>

      {showCreateForm && (
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Введите название заказа"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={handleCreateOrder} disabled={creating} style={{ marginLeft: '8px' }}>
            {creating ? 'Создание...' : 'Сохранить'}
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        {loading ? (
          <p>Загрузка заказов...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : orders.length === 0 ? (
          <p>У вас пока нет заказов.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`}>{order.name}</Link> {/* Ссылка на заказ */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
