import { useState, useEffect } from "react";
import "./App.css";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Members from "./pages/Members";
import Navbar from "./components/Navbar";
import {Routes,Route, useNavigate} from 'react-router-dom';
import Suppliment from "./pages/Suppliment";
import Profile from "./pages/Profile";
import Gym_HomePage from "./pages/Gym_HomePage";
import CartPage from "./pages/CartPage";
import { useUser } from "../context/UserContext";
import NotificationsPanel from "./components/NotificationsPanel";


function App() {

  const [userRole, setUserRole] = useState("");
  const [adminIdToken, setAdminIdToken] = useState("");
  const navigate = useNavigate();
  const {setIsLoggedIn}=useUser();
  
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const idToken = localStorage.getItem("idToken");

    if (userRole && idToken) {
      setUserRole(userRole);

      if (userRole === "admin") {
        setAdminIdToken(idToken);
        navigate("/admin");
      }
    }
  }, [navigate]);

  const handleLoginSuccess = (role, idToken) => {
    localStorage.setItem("userRole", role);
    localStorage.setItem("idToken", idToken);
    setUserRole(role);

    if (role === "admin") {
      setAdminIdToken(idToken);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("uid");
    localStorage.removeItem("userRole");
    setUserRole("");
    setAdminIdToken("");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      {userRole !== "admin" && <Navbar onLogout={handleLogout} userRole={userRole} />}
      <Routes>
        <Route path="/" element={<Gym_HomePage/>}/>
        <Route path="/members" element={<Members/>}/>
        <Route path="/supplements" element={<Suppliment/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/cart" element={<CartPage/>} />
        <Route path="/notification" element={<NotificationsPanel/>}/>
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route 
          path="/admin" 
          element={
            userRole === "admin" ? (
              <AdminDashboard
                adminIdToken={adminIdToken}
                onLogout={handleLogout}
              />
            ) : (
              <div style={{textAlign: "center", padding: "50px"}}>
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
              </div>
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
