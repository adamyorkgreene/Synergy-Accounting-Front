import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MessageResponse, User} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import {useUser} from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";

const UpdateUserSearch: React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [userid, setUserid] = useState<string>('');

    const navigate = useNavigate();

    const {csrfToken} = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!loggedInUser) {
                await fetchUser();
            }
            setIsLoading(false);
        };
        init().then();
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login')
            }
            else if (loggedInUser.userType !== "ADMINISTRATOR"){
                navigate('/dashboard');
                alert('You do not have permission to search for users.')
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email && !username && !userid) {
            alert('Error: At least one field must be filled out.');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {

            const response = await fetch('https://synergyaccounting.app/api/admin/usersearch', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    userid,
                    username,
                }),
            });
            if (response.ok) {
                const userResponse: User = await response.json();
                console.log("Found user: ", userResponse)
                navigate('/dashboard/admin/update-user', {state: {userResponse}});
            } else {
                alert('This user does not exist in the database.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
            <RightDashboard>
                <div style={{position: 'relative', minHeight: '65vh'}} className="dashboard-center-container">
                    <h1 style={{margin: 'unset', marginTop: '2vmin'}}>Search for a User to Update</h1>
                    <div className="extra-margin"></div>
                    <form style={{position: 'relative', display: 'flex', flexDirection: 'column'}}
                        onSubmit={handleSubmit}>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}
                            className="input-group">
                            <label htmlFor="searchemail" className="label">Email </label>
                            <input style={{marginRight: 'calc(50% - 22.274vmin)'}}
                                   type="text" className="custom-input" name="email" value={email} id="searchemail"
                                   autoComplete="email" onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}
                             className="input-group">
                            <label htmlFor="searchuserid" className="label">User ID </label>
                            <input style={{marginRight: 'calc(50% - 22.274vmin)'}}
                                   type="text" className="custom-input" name="userid" value={userid}
                                   id="searchuserid"
                                   autoComplete="userid" onChange={(e) => setUserid(e.target.value)}/>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}
                             className="input-group">
                            <label htmlFor="searchusername" className="label">Username </label>
                            <input style={{marginRight: 'calc(50% - 22.274vmin)'}}
                                   type="text" className="custom-input" name="username" value={username}
                                   id="searchusername"
                                   autoComplete="username" onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        <div style={{display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'center'}}
                            className="input-group">
                            <button style={{width: '44.548vmin'}} type="submit" className="custom-button">Search</button>
                        </div>
                    </form>
                </div>
            </RightDashboard>
    );
};

export default UpdateUserSearch;



