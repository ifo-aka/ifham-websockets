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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    console.log("Signing up:", formData);
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
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
          />
          <Button type="submit">Sign Up</Button>
        </form>
      </div>
    </PageLayout>
  );
};

export default SignupPage;
