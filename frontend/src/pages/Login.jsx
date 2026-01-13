import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. Send token to backend
      const response = await axios.post("http://localhost:5000/login", { idToken });

      // 3. Backend returns uid + role
      setRole(response.data.role);
      alert(`Login successful! Role: ${response.data.role}`);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Gym Management Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {role && <p>Logged in as: {role}</p>}
    </div>
  );
};

export default Login;
