import React, { useEffect, useState } from 'react';

const MonitorPage = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/status`, {
                method: 'GET'
            });
            if (!response.ok) throw new Error(`Ошибка ${response.status}`);
            const data = await response.json();
            setStatus(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // авто-обновление каждые 5 секунд
        return () => clearInterval(interval);
    }, []);

    if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>;
    if (!status) return null;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Системный мониторинг</h2>

            <div style={{ marginBottom: '20px' }}>
                <h3>CPU</h3>
                <p>Загрузка: {status.cpu.percent}%</p>
                <p>Ядер: {status.cpu.count}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>RAM</h3>
                <p>Использовано: {(status.ram.used / (1024 ** 3)).toFixed(2)} GB</p>
                <p>Всего: {(status.ram.total / (1024 ** 3)).toFixed(2)} GB</p>
                <p>Процент: {status.ram.percent}%</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Disk</h3>
                <p>Использовано: {(status.disk.used / (1024 ** 3)).toFixed(2)} GB</p>
                <p>Всего: {(status.disk.total / (1024 ** 3)).toFixed(2)} GB</p>
                <p>Процент: {status.disk.percent}%</p>
            </div>

            <div>
                <h3>Процессы (топ 20)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '5px' }}>PID</th>
                        <th style={{ border: '1px solid #ccc', padding: '5px' }}>Имя</th>
                        <th style={{ border: '1px solid #ccc', padding: '5px' }}>CPU %</th>
                        <th style={{ border: '1px solid #ccc', padding: '5px' }}>RAM %</th>
                    </tr>
                    </thead>
                    <tbody>
                    {status.processes.map(proc => (
                        <tr key={proc.pid}>
                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{proc.pid}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{proc.name}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{proc.cpu_percent}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{proc.memory_percent.toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonitorPage;
