// src/pages/LoginPage.jsx
import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import PageLayout from "../components/PageLayout";
import styles from "../assets/Page.module.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in:", { email, password });
  };

  return (
    <PageLayout>
      <div className={styles.page}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} className={styles.form}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <Button type="submit">Login</Button>
        </form>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
