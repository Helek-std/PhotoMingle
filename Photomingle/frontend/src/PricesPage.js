import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "./DataTable";
import TableHeader from "./TableHeader";

const prices = [
    { id: 1, name: "Формат A4", width_mm: 210, height_mm: 297, price: 150 },
    { id: 2, name: "Формат A3", width_mm: 297, height_mm: 420, price: 250 },
    { id: 3, name: "Формат A5", width_mm: 148, height_mm: 210, price: 100 },
];

export default function PricesPage() {
    const [search, setSearch] = useState("");

    const columns = [
        { key: "name", label: "Название" },
        { key: "width_mm", label: "Ширина (мм)" },
        { key: "height_mm", label: "Длина (мм)" },
        { key: "price", label: "Цена" },
    ];

    // Фильтрация данных по названию
    const filteredPrices = prices.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (row: any) => console.log("Редактировать:", row);
    const handleDelete = (row: any) => console.log("Удалить:", row);

    return (
        <Box sx={{ p: 4 }}>
            <TableHeader searchValue={search} onSearchChange={setSearch}  onAdd={() => console.log("Добавить новый")}/>
            <DataTable
                columns={columns}
                data={filteredPrices}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Box>
    );
}
