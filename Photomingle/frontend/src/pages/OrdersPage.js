import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import TableHeader from "../components/TableHeader";
import DataTable from "../components/DataTable";
import {useDeleteOrderMutation, useGetOrdersQuery} from "../services/ordersApi";
import StatusModal from "../components/StatusModal";
import DeleteOrderModal from "../components/DeleteOrderModal";

export default function OrdersPage() {
    const [search, setSearch] = useState("");

    const { data: orders = [], isLoading, isError } = useGetOrdersQuery({
        search,
        admin_request: true,
    },
    { pollingInterval: 5000 });
    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Название" },
        { key: "user", label: "Заказчик" },
        { key: "status", label: "Статус"}
    ];

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    const handleEdit = (row) => {
        setSelectedOrder(row);
        setOpenModal(true);
    };

    const handleModalClose = (shouldRefetch) => {
        setOpenModal(false);
        setSelectedOrder(null);
    };

    const [selectedOrderToDelete, setSelectedOrderToDelete] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const handleDeleteClick = (row) => {
        setSelectedOrderToDelete(row);
        setOpenDeleteModal(true);
    };

    const handleDeleteModalClose = (deleted) => {
        setOpenDeleteModal(false);
        setSelectedOrderToDelete(null);
    };

    if (isLoading) return <Typography sx={{ p: 4 }}>Загрузка заказов...</Typography>;
    if (isError) return <Typography sx={{ p: 4 }}>Ошибка загрузки заказов</Typography>;

    return (
        <Box sx={{ p: 4 }}>
            <TableHeader
                searchValue={search}
                onSearchChange={setSearch}
                onAdd={openModal}
            />
            <Typography variant="h5" sx={{ mb: 2 }}>
                Заказы
            </Typography>
            <DataTable
                columns={columns}
                data={orders}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />
            <StatusModal open={openModal} onClose={handleModalClose} order={selectedOrder} />
            <DeleteOrderModal open={openDeleteModal} onClose={handleDeleteModalClose} order={selectedOrderToDelete} />
        </Box>

    );
}