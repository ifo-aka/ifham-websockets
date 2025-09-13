// src/App.jsx
import { Routes, Route } from "react-router-dom";
import PageLayout from "./components/PageLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";

const App = () => {
  return (

      <Routes>
        <Route path="/" element={<HomePage />} />
         <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
       <Route path="/chat" element={<ChatPage />} />
      </Routes>
    
  );
};

export default App;
