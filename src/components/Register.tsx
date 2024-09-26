// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { User } from '../Types'; // Assuming User type includes id

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confpassword, setConfPassword] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [birthDate, setBirthDate] = useState<Date>();
    const [address, setAddress] = useState<string>('');

    const navigate = useNavigate(); // Create navigate function

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confpassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            if (birthDate) {
                const birthday = birthDate.getDate() + 1;
                const birthMonth = birthDate.getMonth() + 1;
                const birthYear = birthDate.getFullYear();
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, firstName, lastName, birthday, birthMonth, birthYear, address, password, confpassword }),
                });
                if (response.ok) {
                    const registeredUser: User = await response.json(); // Get registered user
                    const userId = registeredUser.userid; // Get the user ID from the response
                    navigate('/verify', { state: { userId } });
                } else {
                    const errorData = await response.json();
                    alert(`Registration failed: ${errorData.message}`);
                }
            } else {
                alert('Birthday cannot be left empty!')
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
                    <label className="label">First Name </label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label className="label">Last Name </label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label className="label">Birthday </label>
                    <input
                        type="date"
                        value={birthDate ? birthDate.toISOString().substring(0, 10) : ""}
                        onChange={(e) => setBirthDate(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">Address </label>
                    <input type="password" value={address} onChange={(e) => setAddress(e.target.value)}/>
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
