import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import TwoFactorAuth from "./TwoFactorAuth";
import MyOrders from "./MyOrders";
import Logout from "./Logout";
import OrderDetailPage from "./OrderDetailPage"
import InvitedOrderPage from "./InvitedOrderPage"
import ImageRedactor from "./ImageRedactor"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/2fa" element={<TwoFactorAuth />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/orders/invite/:shortcut_url" element={<InvitedOrderPage />} />
	<Route path="/orders/:orderId/addImage" element={<ImageRedactor />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
};

export default App;
