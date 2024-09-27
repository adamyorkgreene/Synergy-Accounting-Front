import React from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Logo from './assets/synergylogo.png';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import ResetPassword from "./components/ResetPassword";
import ResetPasswordForm from './components/ResetPasswordForm';
import ConfirmUser from "./components/ConfirmUser";
import Verify from "./components/Verify";
import Dashboard from "./components/Dashboard";

function App() {
    return (
        <Router>
            <div className="app">
                <header className="app-header">
                    <img src={Logo} alt="Synergy" className="logo" />
                    <div className={"container"}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/login" />}/>
                            <Route path="/login" element={<Login />}  />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify" element={<Verify />} />
                            <Route path="/forgot-password" element={<ResetPassword />} />
                            <Route path="/password-reset" element={<ResetPasswordForm />} />
                            <Route path="/confirm-user" element={<ConfirmUser />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Routes>
                    </div>
                </header>
            </div>
        </Router>
    );
}

export default App;