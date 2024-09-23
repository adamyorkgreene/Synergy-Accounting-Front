import React from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Verify from './components/Verify';
import Logo from './assets/synergylogo.png';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Router>
            <div className="app">
                <header className="app-header">
                    <img src={Logo} alt="Synergy" className="logo" />
                    <div className={"container2"}>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify" element={<Verify />} />
                        </Routes>
                    </div>
                </header>
            </div>
        </Router>
    );
}

export default App;
