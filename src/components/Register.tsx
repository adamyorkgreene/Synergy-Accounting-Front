// src/components/Register.tsx
import React, { useState } from 'react';

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confpassword, setConfPassword] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('http://15.204.199.108:8080/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, username, password, confpassword }),
            });

            if (response.ok) {
                alert('Registration successful!');
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="content">
            <label className="center-text">Create an Account</label>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="label">Enter your Email </label>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label className="label">Create a Username </label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label className="label">Create a Password </label>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label className="label">Confirm Password </label>
                    <input type="text" value={confpassword} onChange={(e) => setConfPassword(e.target.value)}/>
                </div>
                <button type="submit" className="custom-button">Register</button>
            </form>
        </div>
    );
};

export default Register;
