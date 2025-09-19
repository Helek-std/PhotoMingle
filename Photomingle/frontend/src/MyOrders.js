import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {useCreateOrderMutation, useGetOrdersQuery} from "./services/ordersApi";

const MyOrdersPage = () => {
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newName, setNewName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

    const navigate = useNavigate()

    const { data: orders = [], error, isLoading, refetch } = useGetOrdersQuery(debouncedSearch)
    const [createOrder, { isLoading: creating }] = useCreateOrderMutation()

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500)
        return () => clearTimeout(handler)
    }, [searchQuery])

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/users/logout/', {
                method: 'GET',
                credentials: 'include',
            })

            localStorage.removeItem('access_token')
            navigate('/login')

            if (!response.ok) throw new Error('Logout failed')
        } catch (err) {
            console.error('Logout error:', err)
        }
    }

    const handleCreateOrder = async () => {
        if (!newName.trim()) {
            alert('Введите название заказа')
            return
        }
        try {
            await createOrder({ name: newName }).unwrap()
            setNewName('')
            setShowCreateForm(false)
            refetch() // обновляем список
        } catch (err) {
            alert(`Ошибка при создании заказа: ${err.data?.error || err.message}`)
        }
    }

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '40px', color: '#333' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        padding: '8px 16px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        transform: 'translateY(-50%)',
                    }}
                >
                    Выйти
                </button>

                <h2 style={{
                    textAlign: 'center',
                    fontSize: '2rem',
                    marginBottom: '30px',
                    color: '#4CAF50',
                    paddingTop: '20px'
                }}>
                    Мои заказы
                </h2>

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        }}
                    >
                        {showCreateForm ? 'Отменить создание' : '+ Создать новый заказ'}
                    </button>
                </div>

                {showCreateForm && (
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <input
                            type="text"
                            placeholder="Введите название заказа"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            style={{
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                width: '60%',
                                marginRight: '10px',
                            }}
                        />
                        <button
                            onClick={handleCreateOrder}
                            disabled={creating}
                            style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                padding: '10px 15px',
                                border: 'none',
                                borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                            }}
                        >
                            {creating ? 'Создание...' : 'Сохранить'}
                        </button>
                    </div>
                )}

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <input
                        type="text"
                        placeholder="Поиск по заказам..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '60%',
                        }}
                    />
                </div>

                <div style={{
                    marginTop: '30px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>Список заказов</h3>
                    {isLoading ? (
                        <p style={{ textAlign: 'center' }}>Загрузка заказов...</p>
                    ) : error ? (
                        <p style={{ color: 'red', textAlign: 'center' }}>Ошибка загрузки</p>
                    ) : orders.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>У вас пока нет заказов.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {orders.map((order) => (
                                <li key={order.id} style={{
                                    padding: '15px',
                                    margin: '10px 0',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '4px',
                                    borderLeft: '4px solid #4CAF50',
                                }}>
                                    <Link
                                        to={`/orders/${order.id}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: '#333',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                        }}
                                    >
                                        {order.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MyOrdersPage
