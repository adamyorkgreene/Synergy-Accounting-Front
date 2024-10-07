import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageResponse, User, UserType } from '../Types';
import { useCsrf } from '../utilities/CsrfContext';
import {useUser} from "../utilities/UserContext";
import Logo from "../assets/synergylogo.png";

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { setUser } = useUser();
    const { csrfToken, fetchCsrfToken} = useCsrf();
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initCsrf = async () => {
            setLoading(true);
            try {
                await fetchCsrfToken();
            } catch (error) {
                console.error('Failed to fetch CSRF token:', error);
            } finally {
                setLoading(false);
            }
        };
        initCsrf().then();
    }, []);

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
                    } else {
                        const leaveDate: Date = new Date(loggedInUser.tempLeaveStart);
                        const returnDate: Date = new Date(loggedInUser.tempLeaveEnd);
                        if (leaveDate.getTime() < Date.now() && Date.now() < returnDate.getTime()) {
                            alert('Your account is inactive while out on leave.');
                            return;
                        }
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
            <header className="app-header">
                <img src={Logo} alt="Synergy" className="logo"/>
                <div className={"container"}>
                    <div className="content">
                        <label className="center-text">Please Login to Continue</label>
                        <div className="extra-margin"></div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="label">Email </label>
                                <input type="text" className="custom-input5" value={email} onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="input-group">
                                <label className="label">Password </label>
                                <input className="custom-input5" type="password" value={password}
                                       onChange={(e) => setPassword(e.target.value)}/>
                            </div>
                            <div className="extra-margin"></div>
                            <div className="input-group">
                                <button type="submit" className="custom-button">Login</button>
                            </div>
                            <div className="input-group">
                                <button onClick={() => (navigate('/register', {state: {csrfToken}}))} disabled={loading}
                                        className="custom-button">Don't have an account?
                                </button>
                            </div>
                            <div className="input-group">
                                <button onClick={() => (navigate('/forgot-password', {state: {csrfToken}}))}
                                        className="custom-button">Forgot your
                                    password?
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </header>
    );
};


export default Login;
