import React, { useState } from "react";
import { Box } from "@mui/material";
import DataTable from "../components/DataTable";
import TableHeader from "../components/TableHeader";
import {
    useAddFormatMutation,
    useDeleteFormatMutation,
    useEditFormatMutation,
    useGetPrintFormatsQuery
} from "../services/ordersApi";
import PriceModal from "../components/PricesModal";
import DeletePriceModal from "../components/DeletePricesModal";

export default function PricesPage() {
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState(null);

    const { data: prices = [], isLoading, isError } = useGetPrintFormatsQuery(
        { search },
        { pollingInterval: 5000 }
    );
    const [addFormat] = useAddFormatMutation();
    const [editFormat] = useEditFormatMutation();
    const [deleteFormat] = useDeleteFormatMutation();

    const filteredPrices = prices.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedPrice(null);
        setOpenModal(true);
    };

    const handleEdit = (row) => {
        setSelectedPrice(row);
        setOpenModal(true);
    };

    const handleDelete = (row) => {
        setSelectedPrice(row);
        setOpenDeleteModal(true);
    };

    const handleSubmit = (formData) => {
        if (selectedPrice) {
            editFormat(formData);
        } else {
            addFormat(formData);
        }
    };

    const handleConfirmDelete = (item) => {
        deleteFormat(item.id);
        setOpenDeleteModal(false);
        setSelectedPrice(null);
    };

    const columns = [
        { key: "name", label: "Название" },
        { key: "width_mm", label: "Ширина (мм)" },
        { key: "height_mm", label: "Длина (мм)" },
        { key: "price", label: "Цена" },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <TableHeader
                searchValue={search}
                onSearchChange={setSearch}
                onAdd={handleAdd}
            />
            <DataTable
                columns={columns}
                data={filteredPrices}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <PriceModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSubmit={handleSubmit}
                initialData={selectedPrice}
            />

            <DeletePriceModal
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                item={selectedPrice}
            />
        </Box>
    );
}
