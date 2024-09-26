import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {User, UserType} from '../Types'; // Make sure User type is correct

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const loggedInUser: User = await response.json();
                console.log("User data:", loggedInUser);

                const isUserVerified = loggedInUser.isVerified ?? false;
                const userId = loggedInUser.userid ?? null;
                const userType = loggedInUser.userType ?? UserType.DEFAULT;

                if (isUserVerified) {
                    if (userType === UserType.DEFAULT) {
                        alert('Your account has not yet been confirmed by an administrator.')
                        navigate('/');
                        return;
                    }

                    navigate('/dashboard');
                } else {
                    if (userId) {
                        alert('Your account is not yet verified. Please check your email.');
                    } else {
                        console.error('No userId found for unverified user.');
                        alert('User verification failed due to missing user ID.');
                    }
                }
            } else if (response.status === 401 || response.status === 423) {
                const errorMessage = await response.text();
                alert(errorMessage);
            } else {
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="container2">
            <div className="content">
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
                    <button onClick={() => (navigate('/register'))} className="custom-button">Don't have an account?
                    </button>
                </div>
                <button onClick={() => (navigate('/forgot-password'))} className="custom-button">Forgot your
                    password?
                </button>
            </div>
        </div>
    );
};

export default Login;
