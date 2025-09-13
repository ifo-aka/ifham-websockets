// src/components/Button.jsx
import styles from "../assets/Button.module.css";

const Button = ({ children, onClick, type = "button" }) => {
  return (
    <button className={styles.button} type={type} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
