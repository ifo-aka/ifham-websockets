// src/components/Header.jsx
import NavLink from "./NavLink";
import styles from "../assets/Header.module.css";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlics";
import React from "react";

const API_BASE_URL = 'http://localhost:8080'; // Should be in an env variable

const Header = ({ onOpenProfile }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, userObject } = useSelector((s) => s.auth);
  const msgCount = useSelector((s) => s.notification.count);

  const handleLogout = () => {
    dispatch(logout());
  };

  const profilePicUrl = userObject?.profilePictureUrl 
    ? `${API_BASE_URL}${userObject.profilePictureUrl}` 
    : '/src/assets/imges/user-placeholder.png';

  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.list}><NavLink to="/">Home</NavLink></li>
          {!isAuthenticated ? (
            <>
              <li className={styles.list}><NavLink to="/login">Login</NavLink></li>
              <li className={styles.list}><NavLink to="/signup">Signup</NavLink></li>
            </>
          ) : (
            <>
              <li className={styles.list}><NavLink to="/chat">Chat</NavLink>{msgCount > 0 && <div className={styles.notification}>{msgCount}</div>}</li>
              <li className={`${styles.list} ${styles.profile}`} onClick={onOpenProfile}>
                <img src={profilePicUrl} alt="Profile" className={styles.profilePic} />
                <span>{userObject?.nickname || userObject?.username}</span>
              </li>
              <li className={styles.list} onClick={handleLogout}> <NavLink to={"/login"}>Logout</NavLink> </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
