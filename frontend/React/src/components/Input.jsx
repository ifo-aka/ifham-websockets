// src/components/Input.jsx
import styles from "../assets/Input.module.css";
  
const Input = ({ label, type = "text",name, value, onChange, placeholder, required }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input
      id={name}
      name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
        required= {required}
      />
    </div>
  );
};

export default Input;
