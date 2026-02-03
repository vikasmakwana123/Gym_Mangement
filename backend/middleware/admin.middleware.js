// middleware/checkAdmin.js
import { auth, db } from "../firebase.js";

export const checkAdmin = async (req, res, next) => {
  // Get idToken from body (POST) or headers (GET)
  let idToken = req.body?.idToken;
  
  if (!idToken && req.headers.authorization) {
    // Extract from Authorization header if present
    idToken = req.headers.authorization.replace("Bearer ", "");
  }

  if (!idToken) {
    return res.status(401).json({ error: "ID token is required" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (userDoc.exists && userDoc.data().role === "admin") {
      next(); // ✅ allow
    } else {
      res.status(403).json({ error: "Access denied. Admins only." });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
