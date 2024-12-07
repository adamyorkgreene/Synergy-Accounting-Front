import React from 'react';
import Logo from "../assets/synergylogo.png";

interface AlertProps {
    title: string;
    message: string;
}

const Alert: React.FC<AlertProps> = ({title, message}) => {

    return (
        <header className="app-header">
            <img src={Logo} alt="Synergy" className="logo"/>
            <div className="container" style={{paddingTop: "5vh"}}>
                <h1>{title}</h1>
                <div className="center-text">
                    {message}
                </div>
            </div>
        </header>
    );
};


export default Alert;
