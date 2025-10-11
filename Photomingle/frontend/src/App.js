import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import MyOrders from "./MyOrders";
import OrderDetailPage from "./OrderDetailPage"
import InvitedOrderPage from "./InvitedOrderPage"
import ImageRedactor from "./ImageRedactor"
import AdminPage from "./AdminPage";
import HomePage from "./HomePage";
import UsersPage from "./UsersPage";
import OrdersPage from "./OrdersPage";
import PricesPage from "./PricesPage";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/orders/invite/:shortcut_url" element={<InvitedOrderPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<UsersPage />}/>
        <Route path="/admin/orders" element={<OrdersPage />}/>
        <Route path="/admin/prices" element={<PricesPage/>}/>
	    <Route path="/orders/:orderId/addImage" element={<ImageRedactor />} />
      </Routes>
    </Router>
  );
};

export default App;
