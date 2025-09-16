// src/components/Header.jsx
import NavLink from "./NavLink";
import styles from "../assets/Header.module.css";
import { useSelector ,useDispatch} from "react-redux";

import {logout} from "../store/slices/authSlics"


const Header = () => {
  const dispatch = useDispatch()
  const {isAuthenticated} = useSelector((s)=>s.auth)
    const msgCount = useSelector((s) => s.notification.count);
  const handleLogout= ()=>{
    dispatch(logout())
  }
  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.list}><NavLink to="/">Home</NavLink></li>
          {!isAuthenticated ?
            <>
          <li className={styles.list}><NavLink to="/login">Login</NavLink></li>
          <li className={styles.list}><NavLink to="/signup">Signup</NavLink></li>
          </>
           :
           <>
           <li className={styles.list} onClick={handleLogout}> <NavLink to={"/login"}>logout</NavLink> </li>
          <li className={styles.list}><NavLink to="/chat">Chat</NavLink>{msgCount >0 && <div className={styles.notification}>{msgCount}</div>}  </li>
        </>
         }
        </ul>
      </nav>
    </header>
  );
};

export default Header;
