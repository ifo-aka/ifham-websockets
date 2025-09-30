import React, { useState } from 'react';
import styles from '../assets/Card.module.css'; // Using card styles for the modal

const ProfileModal = ({ user, onClose, onSave }) => {
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState(user?.profilePictureUrl || '/src/assets/imges/user-placeholder.png');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nickname', nickname);
        if (profilePicture) {
            formData.append('profilePicture', profilePicture);
        }
        onSave(formData);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.card}>
                <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.profilePicContainer}>
                        <img src={preview} alt="Profile Preview" className={styles.profilePic} />
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="nickname">Nickname</label>
                        <input
                            id="nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Enter your nickname"
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.button}>Save</button>
                        <button type="button" className={styles.buttonSecondary} onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
