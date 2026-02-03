import { db } from "../firebase.js";

// Add or update diet details for a member
export const addUpdateDiet = async (req, res) => {
  try {
    const { memberId, dietDetails } = req.body;

    if (!memberId || !dietDetails) {
      return res.status(400).json({ error: "Member ID and diet details are required" });
    }

    // Check if member exists
    const memberDoc = await db.collection("members").doc(memberId).get();
    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Update member's diet information
    await db.collection("members").doc(memberId).update({
      dietDetails: dietDetails,
      dietUpdatedAt: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Diet details saved successfully",
      memberId,
      dietDetails,
    });
  } catch (error) {
    console.error("Error saving diet details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get diet details for a member
export const getDietDetails = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const memberDoc = await db.collection("members").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const member = memberDoc.data();
    const dietDetails = member.dietDetails || "";

    res.status(200).json({
      memberId,
      dietDetails,
      updatedAt: member.dietUpdatedAt || null,
    });
  } catch (error) {
    console.error("Error fetching diet details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all members for diet management
export const getAllMembersForDiet = async (req, res) => {
  try {
    const membersSnapshot = await db.collection("members").get();

    const members = [];
    membersSnapshot.forEach((doc) => {
      members.push({
        uid: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        dietDetails: doc.data().dietDetails || "",
        dietUpdatedAt: doc.data().dietUpdatedAt || null,
      });
    });

    // Sort by name
    members.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      message: "Members retrieved successfully",
      members,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: error.message });
  }
};
