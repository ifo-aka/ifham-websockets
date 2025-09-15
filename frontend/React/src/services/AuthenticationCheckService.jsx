import { useSelector } from "react-redux";


const AuthenticationCheckService =({children})=>{
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const authChecked = useSelector((state) => state.auth.authChecked);
    console.log(isAuthenticated)

  
  if (!authChecked) {
    // Still checking token -> show loading or nothing
    return <div className="spinner-border" style={{ width: "4rem", height: "4rem" ,position:"absolute",top:"50%",left: "50%"}} role="status">
  <span className="visually-hidden">Loading...</span>
</div>
  }
    // If authenticated, render children; otherwise redirect to login
  
    return isAuthenticated ? children : <Navigate to="/login" replace />;

}
export default AuthenticationCheckService;