// src/App.jsx
import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import Header from "./components/Header";
import ProfileModal from './components/ProfileModal';
import { updateUserProfileThunk } from './store/slices/authSlics';
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const { userObject } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleOpenProfileModal = () => setProfileModalOpen(true);
  const handleCloseProfileModal = () => setProfileModalOpen(false);

  const handleSaveProfile = (formData) => {
    dispatch(updateUserProfileThunk({ userId: userObject.id, formData }))
      .unwrap()
      .then(() => {
        handleCloseProfileModal();
      })
      .catch((error) => {
        console.error("Failed to update profile:", error);
        // Optionally, show an error message to the user
      });
  };

  return (
    <>
      <Header onOpenProfile={handleOpenProfileModal} />
      <Outlet />
      {isProfileModalOpen && userObject && (
        <ProfileModal
          user={userObject}
          onClose={handleCloseProfileModal}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
};

export default App;
