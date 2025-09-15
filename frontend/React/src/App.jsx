// src/App.jsx
import { Routes, Route, Outlet } from "react-router-dom";
import PageLayout from "./components/PageLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import Header from "./components/Header";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <>
    <Header />
    <Outlet />
  </>

    
  );
};

export default App;
