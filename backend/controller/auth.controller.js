// controllers/authController.js
import { auth, db } from "../firebase.js"; // make sure you export auth & db from firebase.js

export const LoginController = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "ID token is required" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check in users collection first (admins)
    let userDoc = await db.collection("users").doc(uid).get();
    let role = "member";
    let userType = "admin";
    
    if (userDoc.exists) {
      role = userDoc.data().role || "member";
      userType = "admin";
    } else {
      // Check in members collection if not found in users
      userDoc = await db.collection("members").doc(uid).get();
      if (userDoc.exists) {
        role = userDoc.data().role || "member";
        userType = "member";
      }
    }

    res.status(200).json({
      message: "Login successful",
      uid,
      role,
      userType,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
// Get user info by UID
export const getUserInfo = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    // Verify token from Authorization header
    let idToken = req.headers.authorization?.replace("Bearer ", "");
    
    if (!idToken) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    try {
      // Verify the token is valid
      await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check in members collection first (members)
    let userDoc = await db.collection("members").doc(uid).get();
    let userData = null;

    if (userDoc.exists) {
      userData = {
        uid,
        role: "member",
        ...userDoc.data(),
      };
    } else {
      // Check in users collection (admins)
      userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        userData = {
          uid,
          role: "admin",
          ...userDoc.data(),
        };
      }
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: error.message });
  }
};