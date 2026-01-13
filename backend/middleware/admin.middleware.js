// middleware/checkAdmin.js
import { auth, db } from "../firebase.js";

export const checkAdmin = async (req, res, next) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (userDoc.exists && userDoc.data().role === "admin") {
      next(); // ✅ allow
    } else {
      res.status(403).json({ error: "Access denied. Admins only." });
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
