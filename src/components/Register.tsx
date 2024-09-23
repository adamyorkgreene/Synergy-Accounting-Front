// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { User } from '../Types'; // Assuming User type includes id

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confpassword, setConfPassword] = useState<string>('');

    const navigate = useNavigate(); // Create navigate function

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confpassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, password, confpassword }),
            });

            if (response.ok) {
                const registeredUser: User = await response.json(); // Get registered user
                const userId = registeredUser.userid; // Get the user ID from the response
                navigate('/verify', { state: { userId } });
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
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label className="label">Confirm Password </label>
                    <input type="password" value={confpassword} onChange={(e) => setConfPassword(e.target.value)}/>
                </div>
                <button type="submit" className="custom-button">Register</button>
            </form>
            <div className={"input-group"}>
                <button onClick={() => (navigate('/'))} className="custom-button">Already have an account?</button>
            </div>
        </div>
    );
};

export default Register;
