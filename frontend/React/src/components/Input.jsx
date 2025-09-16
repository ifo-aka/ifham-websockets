// src/components/Input.jsx
import styles from "../assets/Input.module.css";
  
const Input = ({ label, ...props }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input
  
        className={styles.input}
        {...props}
      />
    </div>
  );
};

export default Input;
