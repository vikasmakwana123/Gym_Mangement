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

    const userDoc = await db.collection("users").doc(uid).get();
    let role = "member"; 
    if (userDoc.exists) {
      role = userDoc.data().role || "member";
    }

    res.status(200).json({
      message: "Login successful",
      uid,
      role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
