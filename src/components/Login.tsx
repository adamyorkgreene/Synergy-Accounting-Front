import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageResponse, User, UserType } from '../Types';
import { useCsrf } from '../utilities/CsrfContext';
import {useUser} from "../utilities/UserContext";

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { setUser } = useUser();
    const { csrfToken, fetchCsrfToken, isReady } = useCsrf();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isReady) {
            fetchCsrfToken();
        }
    }, [isReady, fetchCsrfToken]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        console.log("Submitting login form with email:", email);
        try {
            const response = await fetch('https://synergyaccounting.app/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (response.ok) {
                const loggedInUser: User = await response.json();
                console.log("User data:", loggedInUser);

                const isUserVerified = loggedInUser.isVerified ?? false;
                const userType = loggedInUser.userType ?? UserType.DEFAULT;

                if (isUserVerified) {
                    if (userType === UserType.DEFAULT) {
                        alert('Your account has not yet been confirmed by an administrator.');
                        return;
                    }
                    setUser(loggedInUser);
                    navigate('/dashboard');
                } else {
                    alert('Your account is not yet verified. Please check your email.');
                }
            } else {
                const message: MessageResponse = await response.json();
                alert(message.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        }
    };

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container2">
            <div className="content">
                <meta name="_csrf" content="${_csrf.token}"/>
                <meta name="_csrf_header" content="${_csrf.headerName}"/>
                <label className="center-text">Please Login to Continue</label>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Email </label>
                        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="input-group">
                        <label className="label">Password </label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <button type="submit" className="custom-button">Login</button>
                </form>
                <div className={"input-group"}>
                    <button onClick={() => (navigate('/register', { state: { csrfToken } }))} className="custom-button">Don't have an account?
                    </button>
                </div>
                <button onClick={() => (navigate('/forgot-password', { state: { csrfToken } }))} className="custom-button">Forgot your
                    password?
                </button>
            </div>
        </div>
    );
};

export default Login;
