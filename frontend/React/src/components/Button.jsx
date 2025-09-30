// src/components/Button.jsx
import styles from "../assets/Button.module.css";

const Button = ({ children, onClick, type = "button", disabled }) => {
  return (
    <button className={styles.button} type={type} onClick={onClick}  disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
