import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import PageLayout from "../components/PageLayout";
import styles from "../assets/Page.module.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [strength, setStrength] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");

    if (name === "password") {
      evaluateStrength(value);

      // reset confirm password error when password changes
      if (formData.confirmPassword) {
        checkConfirmPassword(formData.confirmPassword, value);
      }
    }

    if (name === "confirmPassword") {
      checkConfirmPassword(value, formData.password);
    }
  };

  const evaluateStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) setStrength("Weak ❌");
    else if (score === 3 || score === 4) setStrength("Medium ⚠️");
    else if (score === 5) setStrength("Strong ✅");
    else setStrength("");
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const checkConfirmPassword = (confirm, password) => {
    if (!confirm) {
      setConfirmError("");
      return;
    }

    if (!password.startsWith(confirm)) {
      setConfirmError("Does not match the password ❌");
      return;
    }

    if (confirm.length > password.length) {
      setConfirmError("Too long ❌");
      return;
    }

    if (confirm === password) {
      setConfirmError("Passwords match ✅");
    } else {
      setConfirmError("Keep typing...");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match ❌");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Password must meet all requirements before you can sign up."
      );
      return;
    }

    console.log("✅ Signing up:", formData);
    setError("");
  };

  return (
    <PageLayout>
      <div className={styles.page}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup} className={styles.form}>
          <Input
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          {/* Strength Meter */}
          {formData.password && (
            <p
              style={{
                margin: "5px 0",
                fontWeight: "bold",
                color:
                  strength === "Strong ✅"
                    ? "green"
                    : strength === "Medium ⚠️"
                    ? "orange"
                    : "red",
              }}
            >
              Strength: {strength}
            </p>
          )}

          {/* Requirements Checklist */}
          <ul style={{ fontSize: "14px", marginBottom: "10px" }}>
            <li style={{ color: formData.password.length >= 8 ? "green" : "red" }}>
              At least 8 characters
            </li>
            <li style={{ color: /[A-Z]/.test(formData.password) ? "green" : "red" }}>
              At least one uppercase letter
            </li>
            <li style={{ color: /[a-z]/.test(formData.password) ? "green" : "red" }}>
              At least one lowercase letter
            </li>
            <li style={{ color: /\d/.test(formData.password) ? "green" : "red" }}>
              At least one number
            </li>
            <li
              style={{
                color: /[@$!%*?&]/.test(formData.password) ? "green" : "red",
              }}
            >
              At least one special character (@$!%*?&)
            </li>
          </ul>

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
          />

          {confirmError && (
            <p
              style={{
                color:
                  confirmError.includes("✅") ? "green" : "red",
                marginBottom: "10px",
              }}
            >
              {confirmError}
            </p>
          )}

          {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
          <Button type="submit">Sign Up</Button>
        </form>
      </div>
    </PageLayout>
  );
};

export default SignupPage;
