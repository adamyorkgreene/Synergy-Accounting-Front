import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';

const ImageUpload: React.FC = () => {
    const [image, setImage] = useState<File | null>(null);
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser } = useUser();

    useEffect(() => {
        if (!loggedInUser) {
            alert('You need to be logged in to access this page.');
            navigate('/login');
        }
    }, [loggedInUser, navigate]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setImage(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!image) {
            alert("Please select an image to upload");
            return;
        }

        if (!loggedInUser || !csrfToken) {
            alert("You need to be logged in to upload an image");
            navigate('/login');
            return;
        }

        const formData = new FormData();
        formData.append('file', image);

        try {
            const response = await fetch('https://synergyaccounting.app/api/dashboard/upload-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'user': loggedInUser.username
                },
                credentials: 'include'
            });

            if (response.ok) {
                setMessage("Image uploaded successfully");
            } else {
                setMessage("Failed to upload image");
            }
        } catch (error) {
            console.error("Error uploading the image", error);
            setMessage("An error occurred. Please try again.");
        }
    };


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button type="submit">Upload Image</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default ImageUpload;
