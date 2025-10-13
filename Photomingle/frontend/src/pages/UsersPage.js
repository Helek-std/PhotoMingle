import React, { useState } from "react";
import { Box, Avatar } from "@mui/material";
import DataTable from "../components/DataTable";
import TableHeader from "../components/TableHeader";
import UserFormModal from "../components/UserFormModal";
import DeleteModal from "../components/DeleteuserModal";
import {useDeleteUserMutation, useGetUsersQuery} from "../services/usersApi";

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [openFormModal, setOpenFormModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const { data: users = [], isLoading, isError, refetch } = useGetUsersQuery(
        search,
        { pollingInterval: 5000 }
    );

    const [deleteUser] = useDeleteUserMutation();

    const columns = [
        {
            key: "avatar",
            label: "Аватар",
            render: (row: any) => <Avatar src={row.avatar} />,
            width: 60,
        },
        { key: "email", label: "Email" },
        { key: "role", label: "Роль" },
    ];

    const handleAdd = () => {
        setSelectedUser(null);
        setOpenFormModal(true);
    };

    const handleEdit = (row: any) => {
        setSelectedUser(row);
        setOpenFormModal(true);
    };

    const handleDelete = (row: any) => {
        setSelectedUser(row);
        setOpenDeleteModal(true);
    };

    const handleFormClose = (shouldRefetch = false) => {
        setOpenFormModal(false);
        setSelectedUser(null);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser(selectedUser.id).unwrap();
            setOpenDeleteModal(false);
            setSelectedUser(null);
        } catch (err) {
            console.error("Ошибка при удалении пользователя:", err);
        }
    };

    if (isLoading) return <Box sx={{ p: 4 }}>Загрузка пользователей...</Box>;
    if (isError) return <Box sx={{ p: 4 }}>Ошибка при загрузке пользователей</Box>;

    return (
        <Box sx={{ p: 4 }}>
            <TableHeader
                searchValue={search}
                onSearchChange={setSearch}
                onAdd={handleAdd}
            />
            <DataTable
                columns={columns}
                data={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            {openFormModal && (
                <UserFormModal
                    open={openFormModal}
                    handleClose={handleFormClose}
                    user={selectedUser}
                    admin={true}
                />
            )}

            {/* Модалка удаления */}
            {openDeleteModal && selectedUser && (
                <DeleteModal
                    open={openDeleteModal}
                    handleClose={() => setOpenDeleteModal(false)}
                    title="Удалить пользователя?"
                    message={`Вы уверены, что хотите удалить ${selectedUser.email}?`}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </Box>
    );
}
