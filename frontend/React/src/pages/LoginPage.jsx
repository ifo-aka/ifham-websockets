// src/pages/LoginPage.jsx
import { useEffect, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import PageLayout from "../components/PageLayout";
import styles from "../assets/Page.module.css";
import Container from "../components/Container";
import {loginThunk} from "../store/slices/authSlics"
import { useDispatch, useSelector } from "react-redux";
import {  useNavigate } from "react-router-dom";

const LoginPage = () => {
  const {isAuthenticated} = useSelector((s)=>s.auth)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
   const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in:", { username, password });
  
  dispatch(loginThunk({username,password})).then(res=>{
    console.log(res)
    if(res.payload?.success == false){
      setError(res.payload.data)
      setTimeout(() => {
        setError("")
      }, 5000);
    }
  })
  };
  
    useEffect(()=>{
       if(isAuthenticated){
        navigate("/")
       }
    },[isAuthenticated])

  return (
    <Container>
      <div className={styles.page}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} className={styles.form}>
          <Input
            label="User Name"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required = {true}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required={true}
          />
            {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
          <Button type="submit">Login</Button>
        </form>
      </div>
   </Container>
  );
};

export default LoginPage;
