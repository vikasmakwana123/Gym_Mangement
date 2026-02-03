// adminController.js
import { auth, db } from "../firebase.js"; // your firebase.js setup
import { calculateExpiryDate } from "../utils/packageUtils.js";


const CreateUserController =  async (req, res) => {
  const { email, password, name, role, packageType } = req.body;

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Calculate expiry date based on package type
    const selectedPackage = packageType || "basic";
    const expiryDate = calculateExpiryDate(selectedPackage);

    // 3. Save user details in Firestore (members collection)
    const memberData = {
      uid: userRecord.uid,
      email,
      name,
      role: "member", // Members always have role: member
      packageType: selectedPackage,
      status: "active",
      joinDate: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    await db.collection("members").doc(userRecord.uid).set(memberData);

    res.status(201).json({
      message: "Member account created successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: "member",
        packageType: selectedPackage,
        status: "active",
        expiryDate: expiryDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(400).json({ error: error.message });
  }
}

export default CreateUserController;
