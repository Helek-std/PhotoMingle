import React, {useState} from "react";
import { Box, Avatar, Typography } from "@mui/material";
import DataTable from "../components/DataTable";
import TableHeader from "../components/TableHeader";

const users = [
    { id: 1, name: "Иван Иванов", email: "ivan@example.com", avatar: "https://i.pravatar.cc/40?img=1" },
    { id: 2, name: "Мария Петрова", email: "maria@example.com", avatar: "https://i.pravatar.cc/40?img=2" },
];

export default function UsersPage() {

    const [search, setSearch] = useState("");
    const columns = [
        {
            key: "avatar",
            label: "Аватар",
            render: (row: any) => <Avatar src={row.avatar} />,
            width: 60,
        },
        { key: "name", label: "Имя" },
        { key: "email", label: "Email" },
    ];

    const handleEdit = (row: any) => {
        console.log("Редактировать:", row);
    };
    const handleDelete = (row: any) => {
        console.log("Удалить:", row);
    };

    return (
        <Box sx={{ p: 4 }}>
            <TableHeader searchValue={search} onSearchChange={setSearch}  onAdd={() => console.log("Добавить новый")}/>
            <DataTable columns={columns} data={users} onEdit={handleEdit} onDelete={handleDelete} />
        </Box>
    );
}
