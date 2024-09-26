// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { User } from '../Types'; // Assuming User type includes id

const Register: React.FC = () => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [emailAddress, setEmailAddress] = useState<string>('');
    const [dob, setDob] = useState<string>('');

    const navigate = useNavigate(); // Create navigate function

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
            // Validate information has been entered
            if (!firstName || !lastName || !emailAddress || !dob) {
                alert('Please fill out all fields.');
                return;
            }

            try {
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firstName, lastName, emailAddress, dob }),
                });
    
                if (response.ok) {
                    // If registration request is successful, notify user
                    alert('Registration request submitted. Please wait for approval.');
                    navigate('/'); // Redirect to login page after submission
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
                <label className="center-text">Create a New User</label>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">First Name </label>
                        <input 
                            type="text" 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Last Name </label>
                        <input 
                            type="text" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Email Address </label>
                        <input 
                            type="text" 
                            value={emailAddress} 
                            onChange={(e) => setEmailAddress(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Date of Birth </label>
                        <input 
                            type="date" 
                            value={dob} 
                            onChange={(e) => setDob(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="custom-button">Request Access</button>
                </form>
                <div className={"input-group"}>
                    <button onClick={() => navigate('/')} className="custom-button">Already have an account?</button>
                </div>
            </div>
        );
    };
    
    export default Register;

