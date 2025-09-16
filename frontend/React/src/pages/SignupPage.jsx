import { useEffect, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import PageLayout from "../components/PageLayout";
import styles from "../assets/Page.module.css";
import { useDispatch, useSelector } from "react-redux";
import { signupThunk ,setShowSpinner,setAuthChecked,setAuthentication} from "../store/slices/authSlics";
import Container from "../components/Container";
import {  useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSpinner, isAuthenticated, userObject } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [strength, setStrength] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        setPhoneError("Phone number must contain only digits");
        return;
      }
      // Enforce max length
      if (value.length > 11) {
        setPhoneError("Phone number must be exactly 11 digits");
        return;
      }
      // Must start with 034
      if (value.length >= 3 && !value.startsWith("034")) {
        setPhoneError("Phone number must start with 034");
        return;
      }
      setPhoneError("");
    }
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
  // Handle Enter key for phone number validation
if (name === "phoneNumber") {
  // Keep only digits and trim to 11 max
  const onlyNums = value.replace(/\D/g, "").slice(0, 11);

  setFormData({
    ...formData,
    phoneNumber: onlyNums,
  });

  // Validation
  if (onlyNums.length !== 11) {
    setPhoneError("Phone number must be exactly 11 digits");
  } else if (!onlyNums.startsWith("034")) {
    setPhoneError("Phone number must start with 034");
  } else {
    setPhoneError("");
  }
  return; // stop here
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
    const obj = {
      username : formData.username,
      email: formData.email,
      phonenumber: formData.phoneNumber,
      password: formData.password
    }
    console.log("Signup data:", typeof(obj.phoneNumber));
  dispatch(setShowSpinner(true));
  setAuthChecked(false);
    dispatch(signupThunk(obj)).then((response ) => {
      console.log("Signup response:", response);
      if(response.payload?.success == true){
        dispatch(setShowSpinner(false));
        dispatch(setAuthChecked(true));
        dispatch(setAuthentication(true));
      }
      if (response.payload?.success == false) {
        dispatch(setShowSpinner(false));
        dispatch(setAuthChecked(true));
        const data = response.payload?.data;
        if(data.username){
          setError( data.username)
          setTimeout(() => {
            setError("")
          }, 5000);
          return
        }else if(data.email){
          setError( data.email)
                   setTimeout(() => {
            setError("")
          }, 5000);
          return
        }
        else if(data.password){
          setError( data.password)
                   setTimeout(() => {
            setError("")
          }, 5000);
          return
        }
        setError( "Signup failed ❌");
      }
    });

    console.log("✅ Signing up:", obj);
   
  };
  useEffect(()=>{
     if(isAuthenticated){
      navigate("/")
     }
  },[isAuthenticated])

  return (
    <Container>
      <div className={styles.page}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup} className={styles.form}>
          <Input
            label="Name"
            type="text"
            name="username"
            value={formData.username}
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
            label="Phone Number"
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            
            placeholder="Enter your phone number"
            maxLength={11}
            inputMode="numeric"
            pattern="\d*"
          />
          {/* Phone validation message */}
          {(phoneError || formData.phoneNumber) && (
            <p style={{
              color: phoneError ? "red" : (/^034\d{8}$/.test(formData.phoneNumber) ? "green" : "red"),
              marginBottom: "10px",
              fontSize: "14px"
            }}>
              {phoneError
                ? phoneError
                : (formData.phoneNumber.length === 11 && formData.phoneNumber.startsWith("034") && /^\d{11}$/.test(formData.phoneNumber))
                ? "Valid phone number ✅"
                : "Phone number must start with 034 and be exactly 11 digits"}
            </p>
          )}
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
    </Container>
  );
};

export default SignupPage;
