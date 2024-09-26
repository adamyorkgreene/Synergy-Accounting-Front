import React from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Verify from './components/Verify';
import Logo from './assets/synergylogo.png'; // Ensure this path is correct
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Ensure Link is imported
import ResetPassword from "./components/ResetPassword";
import ResetPasswordForm from './components/ResetPasswordForm';

function App() {
    return (
        <Router>
            <div className="app">
                <header className="app-header">
                    {/* Clickable logo to navigate to login page */}
                    <Link to="/"> 
                        <img src={Logo} alt="Synergy" className="logo" />
                    </Link>
                    <div className={"container2"}>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify" element={<Verify />} />
                            <Route path="/forgot-password" element={<ResetPassword />} />
                            <Route path="/password-reset" element={<ResetPasswordForm />} />
                        </Routes>
                    </div>
                </header>
            </div>
        </Router>
    );
}

export default App;
