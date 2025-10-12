import React from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    IconButton,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Column {
    key: string;
    label: string;
    render?: (row: any) => React.ReactNode;
    width?: string | number;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, onEdit, onDelete }) => {
    return (
        <Paper elevation={8} sx={{ borderRadius: 3, overflow: "hidden", width: "100%" }}>
            <Table>
                <TableHead sx={{ backgroundColor: "#111" }}>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={col.key} sx={{ color: "#fff", fontWeight: 600, width: col.width }}>
                                {col.label}
                            </TableCell>
                        ))}
                        {(onEdit || onDelete) && (
                            <TableCell sx={{ color: "#fff", fontWeight: 600, textAlign: "center" }}>Действия</TableCell>
                        )}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data.map((row, idx) => (
                        <TableRow key={idx} sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                            {columns.map((col) => (
                                <TableCell key={col.key}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </TableCell>
                            ))}
                            {(onEdit || onDelete) && (
                                <TableCell sx={{ textAlign: "center" }}>
                                    {onEdit && (
                                        <IconButton color="primary" onClick={() => onEdit(row)}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    {onDelete && (
                                        <IconButton color="error" onClick={() => onDelete(row)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default DataTable;
