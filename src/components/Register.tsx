import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageResponse } from '../Types';
import { useCsrf } from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confpassword, setConfPassword] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [birthday, setBirthday] = useState<Date>();
    const [address, setAddress] = useState<string>('');

    const navigate = useNavigate();

    const {csrfToken} = useCsrf();

    const validatePassword = (password: string): boolean => {
        const minLength = 8;
        const startsWithLetter = /^[A-Za-z]/.test(password);
        const containsLetter = /[A-Za-z]/.test(password);
        const containsNumber = /\d/.test(password);
        const containsSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            password.length >= minLength &&
            startsWithLetter &&
            containsLetter &&
            containsNumber &&
            containsSpecialChar
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confpassword) {
            alert('Passwords do not match.');
            return;
        }

        if (!firstName || !lastName || !email || !address) {
            alert('Please fill out all fields.');
            return;
        }

        if (!validatePassword(password)) {
            alert('Password must be at least 8 characters long, start with a letter, and include a letter, number, and special character.');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {

            if (birthday) {
                const response = await fetch('https://synergyaccounting.app/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        email,
                        firstName,
                        lastName,
                        birthday,
                        address,
                        password,
                        confpassword
                    }),
                });
                const msgResponse: MessageResponse = await response.json();

                if (response.ok) {
                    alert(msgResponse.message);
                    navigate('/login');
                } else {
                    alert(msgResponse.message);
                }
            } else {
                alert('Birthday cannot be left empty!')
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Your session has expired. Refreshing page..');
            navigate('/register');
        }
    };

    return (
        <header className="app-header">
            <img src={Logo} alt="Synergy" className="logo"/>
            <div className="container">
                <div className="content">
                    <label className="center-text">Create an Account</label>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">Enter your Email </label>
                            <input type="text" className="custom-input" value={email}
                                   onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">First Name </label>
                            <input type="text" className="custom-input" value={firstName}
                                   onChange={(e) => setFirstName(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Last Name </label>
                            <input type="text" className="custom-input" value={lastName}
                                   onChange={(e) => setLastName(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Birthday </label>
                            <input type="date" className="custom-input"
                                   value={birthday ? birthday.toISOString().substring(0, 10) : ""}
                                   onChange={(e) => setBirthday(e.target.value ? new Date(e.target.value) : undefined)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Address </label>
                            <input type="text" className="custom-input" value={address}
                                   onChange={(e) => setAddress(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Create a Password </label>
                            <input type="password" className="custom-input" value={password}
                                   onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Confirm Password </label>
                            <input type="password" className="custom-input" value={confpassword}
                                   onChange={(e) => setConfPassword(e.target.value)}/>
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Register</button>
                        </div>
                        <div className="input-group">
                            <button onClick={() => navigate('/login', {state: {csrfToken}})}
                                    className="custom-button">Already have an account?
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default Register;



