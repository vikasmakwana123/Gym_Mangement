
// controllers/adminController.js
import { auth, db } from "../firebase.js"; // Firebase Admin SDK setup

// Create a new Admin account
export const createAdminAccount = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    

    // 1. Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Assign role in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role: "admin",   // 👈 Important: mark as admin
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Admin account created successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(400).json({ error: error.message });
  }
};

