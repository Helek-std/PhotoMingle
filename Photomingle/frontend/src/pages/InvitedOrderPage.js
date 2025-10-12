import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderInvitePage = () => {
  const { shortcut_url } = useParams();
  const [orderName, setOrderName] = useState('');
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const response = await fetch(`/api/orders/invite/${shortcut_url}/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Ошибка при добавлении в заказ');
        }

        const data = await response.json();
        setOrderName(data.order_name);
        setDetail(data.detail);
      } catch (err) {
        setError(err.message);
      }
    };

    acceptInvite();
  }, [shortcut_url, token]);

   if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: 'red' }}>
        {error}
      </div>
    );
  }

  if (!orderName) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
        {detail || 'Добавление в заказ...'}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h2 style={{ fontSize: '2rem' }}>
        Заказ <strong>{orderName}</strong> был добавлен в ваши заказы.
      </h2>
      <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>
        Перейти к{' '}
        <Link to="/orders" style={{ color: 'green', fontWeight: 'bold', textDecoration: 'none' }}>
          вашим заказам
        </Link>.
      </p>
    </div>
  );
};

export default OrderInvitePage;
