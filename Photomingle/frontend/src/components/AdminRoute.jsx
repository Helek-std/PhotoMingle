import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMyInfoQuery } from '../services/usersApi';

const AdminRoute = ({ children }) => {
    const { data: user, isLoading } = useMyInfoQuery();

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (!user || (!user.is_staff && !user.is_admin && user.role !== 'admin')) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
