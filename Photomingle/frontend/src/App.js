import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import OrderDetailPage from "./pages/OrderDetailPage"
import InvitedOrderPage from "./pages/InvitedOrderPage"
import ImageRedactor from "./pages/ImageRedactor"
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import PricesPage from "./pages/PricesPage";
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
	    <Route path="/orders/:orderId/addImage" element={<ImageRedactor />}/>
      </Routes>
    </Router>
  );
};

export default App;
