import React, { useState } from 'react';
import './App.css';
import Calendar from './components/Calendar';
import Login from './components/Login';
import Register from './components/Register';
import Verify from './components/Verify';
import Logo from './assets/synergylogo.png'; // Ensure this path is correct
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'; // Ensure Link and Navigate are imported
import ResetPassword from "./components/ResetPassword";
import ResetPasswordForm from './components/ResetPasswordForm';
import ConfirmUser from "./components/ConfirmUser";
import Dashboard from "./components/Dashboard";
import ImageUpload from "./components/ImageUploader";
import AddUser from "./components/AddUser";
import UpdateUserSearch from "./components/UpdateUserSearch";
import UpdateUser from "./components/UpdateUser";
import SendAdminEmail from "./components/SendAdminEmail";
import ChartOfAccounts from "./components/ChartOfAccounts";
import AdminInbox from "./components/AdminInbox";
import Logout from "./components/Logout";
import { User } from "./Types";
import AddAccount from "./components/AddAccount";
import AddTransaction from "./components/AddTransaction";
import UpdateTransaction from "./components/UpdateTransaction";

function App() {
    const [userResponse, setUserResponse] = useState<User | null>(null);

    return (
        <Router>
            <div className="app">
                <Calendar />
                <header className="app-header">
                    {/* Clickable logo to navigate to login page */}
                    <Link to="/"> 
                        <img src={Logo} alt="Synergy" className="logo" />
                    </Link>
                    <div className={"container2"}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/login"/>} />
                            <Route path="/logout" element={<Logout />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify" element={<Verify />} />
                            <Route path="/forgot-password" element={<ResetPassword />} />
                            <Route path="/password-reset" element={<ResetPasswordForm />} />
                            <Route path="/confirm-user" element={<ConfirmUser />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/upload-image" element={<ImageUpload />} />
                            <Route path="/dashboard/admin/add-user" element={<AddUser />} />
                            <Route path="/dashboard/admin/update-user-search" element={<UpdateUserSearch />} />
                            <Route path="/dashboard/admin/update-user"
                                   element={<UpdateUser userResponse={userResponse} setUserResponse={setUserResponse} />} />
                            <Route path="/dashboard/admin/send-email" element={<SendAdminEmail />} />
                            <Route path="/dashboard/admin/inbox" element={<AdminInbox />} />
                            <Route path="/dashboard/chart-of-accounts" element={<ChartOfAccounts />} />
                            <Route path="/dashboard/chart-of-accounts/add" element={<AddAccount />} />
                            <Route path="/dashboard/chart-of-accounts/add-transaction" element={<AddTransaction />} />
                            <Route path="/dashboard/chart-of-accounts/update-transaction" element={<UpdateTransaction />} />
                        </Routes>
                    </div>
                </header>
            </div>
        </Router>
    );
}

export default App;
