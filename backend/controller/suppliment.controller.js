import { auth, db } from "../firebase.js";
import { supabase } from "../supabase.js";

export const GetSupplements = async (req, res) => {
  try {
    // Fetch all supplements from Firestore (PUBLIC)
    const snapshot = await db.collection("supplements").get();

    const supplements = [];

    snapshot.forEach((doc) => {
      supplements.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(supplements);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    res.status(500).json({ error: "Failed to fetch supplements" });
  }
};


export const AddSuppliments = async (req, res) => {
  const { name, description, price,weight } = req.body;
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  const file = req.file; // Multer file object

  try {
    // 1. Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Check role in Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    // 3. Upload image to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("Suppliments") // 👈 your bucket name
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });
    console.log("Upload Error:", uploadError);
    if (uploadError) throw uploadError;

    // 4. Get public URL of uploaded image
    const { data: publicUrlData } = supabase.storage
      .from("Suppliments")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // 5. Store supplement data in Firestore
    await db.collection("supplements").add({
      name,
      description,
      price,
      imageUrl,
      weight,
      createdBy: uid,
      createdAt: new Date().toISOString(),
    });
    console.log("Supplement added successfully");
    res.status(201).json({
      message: "Supplement added successfully",
      supplement: {
        name,
        description,
        price,
        weight,
        imageUrl,
        weight,
      },
    });
  } catch (error) {
    console.error("Error adding supplement:", error);
    res.status(400).json({ error: error.message });
  }
};
