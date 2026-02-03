import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useUser(); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const idToken = await userCredential.user.getIdToken();
      const uid = userCredential.user.uid;

      // 2️⃣ Verify role from backend
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        { idToken }
      );

      const userRole = response.data.role;

      // 3️⃣ Persist auth data
      localStorage.setItem("idToken", idToken);
      localStorage.setItem("uid", uid);
      localStorage.setItem("userRole", userRole);

      // 4️⃣ Sync with UserContext
      login(userRole);
      
      // 4.5️⃣ Call parent callback to update App state
      if (onLoginSuccess) {
        onLoginSuccess(userRole, idToken);
      }

      // 5️⃣ Navigate based on role
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h2>Gym Management</h2>
          <p style={{ opacity: 0.8 }}>Manage Your Fitness Goals</p>
        </div>

        {/* Form */}
        <div style={{ padding: "30px" }}>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            {error && (
              <div style={{ color: "red", marginBottom: "10px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
