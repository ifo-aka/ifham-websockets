// src/components/Header.jsx
import NavLink from "./NavLink";
import styles from "../assets/Header.module.css";
const msgCount = 1;


const Header = () => {
  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.list}><NavLink to="/">Home</NavLink></li>
          <li className={styles.list}><NavLink to="/login">Login</NavLink></li>
          <li className={styles.list}><NavLink to="/signup">Signup</NavLink></li>
          <li className={styles.list}><NavLink to="/chat">Chat</NavLink>{msgCount >0 && <div className={styles.notification}>{msgCount}</div>}  </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
