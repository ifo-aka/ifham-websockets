// src/components/NavLink.jsx
import { NavLink as RouterLink } from "react-router-dom";
import styles from "../assets/NavLink.module.css";

const NavLink = ({ to, children }) => {
  return (
    <RouterLink
      to={to}
      className={({ isActive }) =>
        isActive ? `${styles.link} ${styles.active}` : styles.link
      }
    >
      {children}
    </RouterLink>
  );
};

export default NavLink;
