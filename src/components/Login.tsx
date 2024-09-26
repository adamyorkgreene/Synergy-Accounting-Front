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
                const loggedInUser: User = await response.json(); // Log the entire response for debugging
                console.log("User data:", loggedInUser); // Debug the response to ensure it matches expectations

                const isUserVerified = loggedInUser.isVerified ?? false; // Safely access the isVerified property
                const userId = loggedInUser.userid ?? null; // Safely access userId, set null as fallback
                const userType = loggedInUser.userType ?? UserType.DEFAULT;

                if (isUserVerified) {
                    if (userType === UserType.DEFAULT) {
                        alert('Your account has not yet been confirmed by an administrator.')
                        navigate('/');
                        return;
                    }
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
        <div className="content">
            <label className="center-text">Please Login to Continue</label>
            <form onSubmit={handleSubmit}>
                <div className="form_group">
                    <div className="input-group">
                        <label className="label">Email </label>
                        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="input-group">
                        <label className="label">Password </label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                </div>
                <div className="button-group">
                    <button type="submit" className="custom-button">Login</button>
                    <button onClick={() => (navigate('/register'))} className="custom-button">Don't have an account?
                    </button>
                    <button onClick={() => (navigate('/forgot-password'))} className="custom-button">Forgot your
                        password?
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;
