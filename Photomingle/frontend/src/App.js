import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import TwoFactorAuth from "./TwoFactorAuth";
import MyOrders from "./MyOrders";
import Logout from "./Logout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/2fa" element={<TwoFactorAuth />} />
        <Route path ="/myorders" element={<MyOrders />} />
        <Route path ="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
};

export default App;
