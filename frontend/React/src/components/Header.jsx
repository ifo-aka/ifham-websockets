// src/components/Header.jsx
import NavLink from "./NavLink";
import styles from "../assets/Header.module.css";


const Header = () => {
  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.navList}>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/login">Login</NavLink></li>
          <li><NavLink to="/signup">Signup</NavLink></li>
          <li><NavLink to="/chat">Chat</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
