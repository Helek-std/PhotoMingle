import React, {useState} from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "./DataTable";
import TableHeader from "./TableHeader";
import ResponsiveAppBar from "./ResponsiveAppBar";

const orders = [
    { id: 1, product: "Печать А4", price: 150, status: "В обработке" },
    { id: 2, product: "Печать А3", price: 250, status: "Готово" },
];

export default function OrdersPage() {
    const [search, setSearch] = useState("");
    const columns = [
        { key: "product", label: "Товар" },
        { key: "price", label: "Цена" },
        { key: "status", label: "Статус" },
    ];

    const handleEdit = (row: any) => console.log("Редактировать:", row);
    const handleDelete = (row: any) => console.log("Удалить:", row);

    return (
        <Box sx={{ p: 4 }}>
            <TableHeader searchValue={search} onSearchChange={setSearch}  onAdd={() => console.log("Добавить новый")}/>
            <DataTable columns={columns} data={orders} onEdit={handleEdit} onDelete={handleDelete} />
        </Box>
    );
}
