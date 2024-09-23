import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../Types'; // Make sure User type is correct

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate(); // Create navigate function

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const loggedInUser: User = await response.json(); // Log the entire response for debugging
                console.log("User data:", loggedInUser); // Debug the response to ensure it matches expectations

                const isUserVerified = loggedInUser.isVerified ?? false; // Safely access the isVerified property
                const userId = loggedInUser.userid ?? null; // Safely access userId, set null as fallback

                if (isUserVerified) {
                    alert('Login Successful!');
                    // Navigate to dashboard or wherever you want after successful login
                    navigate('/dashboard'); // Make sure /dashboard is a valid route
                } else {
                    if (userId) {
                        // Navigate to the verify page with the userId
                        navigate('/verify', { state: { userId } });
                    } else {
                        console.error('No userId found for unverified user.');
                        alert('User verification failed due to missing user ID.');
                    }
                }
            } else if (response.status === 401) {
                alert('Login failed: Incorrect username or password.');
            } else {
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="content">
            <label className="center-text">Please Login to Continue</label>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="label">Username </label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="input-group">
                    <label className="label">Password </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="custom-button">Login</button>
            </form>
            <div className={"input-group"}>
                <button onClick={() => (navigate('/register'))} className="custom-button">Don't have an account?</button>
            </div>
        </div>
    );
};

export default Login;
