// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import AuthenticationCheckService from "./services/AuthenticationCheckService";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import AppContextProvider from "./context/AppContextProvider";

function AppRoutes() {


  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />, // Layout with Sidebar + Header + Outlet
      children: [
        { index: true, element: <HomePage /> }, // this is "/"
        
        { path: 'login', element: <LoginPage /> },
    { path: 'signup', element: <SignupPage /> },
    {
      path: 'chat', element: (
        <AuthenticationCheckService>
          <ChatPage />
        </AuthenticationCheckService>
      ),
    }


  

      ],
    },

    // Standalone routes (no App layout)
    
    // { path: '/about', element: <About /> },
    
    { path: '*', element: <NotFound /> },
  ]);

  return <RouterProvider router={router} />;
}
ReactDOM.createRoot(document.getElementById("root")).render(
 
    <Provider store={store}>
<AppContextProvider>
      <AppRoutes />
      </AppContextProvider>
    </Provider>
 
);
