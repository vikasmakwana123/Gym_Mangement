// adminController.js
import { auth, db } from "../firebase.js"; // your firebase.js setup


const CreateUserController =  async (req, res) => {
  const { email, password, name, role, packageType } = req.body;

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Save user details in Firestore
    await db.collection("members").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role: role || "member", // default role
      packageType: packageType || "basic",
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "User account created successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role,
        packageType,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: error.message });
  }
}

export default CreateUserController;
