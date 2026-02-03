
// controllers/adminController.js
import { auth, db } from "../firebase.js"; // Firebase Admin SDK setup
import { calculateExpiryDate, getPackageDetails } from "../utils/packageUtils.js";

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

// Add new member (Admin only)
export const addNewMember = async (req, res) => {
  const { email, password, name, packageType } = req.body;

  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({ 
      error: "Email, password, and name are required" 
    });
  }

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
    const packageDetails = getPackageDetails(selectedPackage);

    // 3. Save member details in Firestore
    const memberData = {
      uid: userRecord.uid,
      email,
      name,
      role: "member",
      packageType: selectedPackage,
      status: "active",
      joinDate: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    await db.collection("members").doc(userRecord.uid).set(memberData);

    // 4. Create an order for the membership package (track revenue)
    if (packageDetails.price > 0) {
      const orderId = `membership_${userRecord.uid}_${Date.now()}`;
      const orderData = {
        _id: orderId,
        memberId: userRecord.uid,
        memberName: name,
        memberEmail: email,
        items: [{
          name: packageDetails.name,
          description: `Membership: ${packageDetails.duration}`,
          price: packageDetails.price,
          type: "membership"
        }],
        totalPrice: packageDetails.price,
        status: "confirmed",
        placedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("orders").doc(orderId).set(orderData);
    }

    res.status(201).json({
      message: "Member added successfully",
      member: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: "member",
        packageType: selectedPackage,
        status: "active",
        joinDate: memberData.joinDate,
        expiryDate: expiryDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all members (Admin only)
export const getAllMembers = async (req, res) => {
  try {
    const membersSnapshot = await db.collection("members").get();
    const members = [];

    membersSnapshot.forEach((doc) => {
      members.push({
        uid: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({
      message: "Members fetched successfully",
      total: members.length,
      members,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update member (Admin only)
export const updateMember = async (req, res) => {
  const { memberId } = req.params;
  const { name, packageType, status } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (packageType) updateData.packageType = packageType;
    if (status) updateData.status = status;
    updateData.updatedAt = new Date().toISOString();

    await db.collection("members").doc(memberId).update(updateData);

    res.status(200).json({
      message: "Member updated successfully",
      memberId,
      updates: updateData,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete member (Admin only)
export const deleteMember = async (req, res) => {
  const { memberId } = req.params;

  try {
    // Delete from Firestore
    await db.collection("members").doc(memberId).delete();
    
    // Delete from Firebase Auth
    await auth.deleteUser(memberId);

    res.status(200).json({
      message: "Member deleted successfully",
      memberId,
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(400).json({ error: error.message });
  }
};
// Renew membership (Admin only)
export const renewMembership = async (req, res) => {
  const { memberId } = req.params;
  const { packageType } = req.body;

  try {
    if (!packageType) {
      return res.status(400).json({ error: "Package type is required" });
    }

    // Get member data for order creation
    const memberSnapshot = await db.collection("members").doc(memberId).get();
    if (!memberSnapshot.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberSnapshot.data();

    // Calculate new expiry date and get package details
    const expiryDate = calculateExpiryDate(packageType);
    const packageDetails = getPackageDetails(packageType);

    // Update member
    await db.collection("members").doc(memberId).update({
      packageType,
      expiryDate: expiryDate.toISOString(),
      status: "active",
      updatedAt: new Date().toISOString(),
    });

    // Create an order for the renewal (track revenue)
    if (packageDetails.price > 0) {
      const orderId = `renewal_${memberId}_${Date.now()}`;
      const orderData = {
        _id: orderId,
        memberId: memberId,
        memberName: memberData.name,
        memberEmail: memberData.email,
        items: [{
          name: packageDetails.name,
          description: `Membership Renewal: ${packageDetails.duration}`,
          price: packageDetails.price,
          type: "membership_renewal"
        }],
        totalPrice: packageDetails.price,
        status: "confirmed",
        placedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("orders").doc(orderId).set(orderData);
    }

    res.status(200).json({
      message: "Membership renewed successfully",
      memberId,
      packageType,
      expiryDate: expiryDate.toISOString(),
    });
  } catch (error) {
    console.error("Error renewing membership:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get admin stats for report
export const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all members
    const membersSnapshot = await db.collection("members").get();
    const allMembers = membersSnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    }));

    // Count new members this month
    const newMembers = allMembers.filter(member => {
      const createdDate = new Date(member.createdAt);
      return createdDate >= startOfMonth && createdDate <= endOfMonth;
    }).length;

    // Count renewed members this month (check updatedAt)
    const renewedMembers = allMembers.filter(member => {
      const updatedDate = new Date(member.updatedAt || member.createdAt);
      return updatedDate >= startOfMonth && updatedDate <= endOfMonth &&
             updatedDate.getTime() !== new Date(member.createdAt).getTime() &&
             member.status === "active";
    }).length;

    // Count expired members this month
    const expiredMembers = allMembers.filter(member => {
      if (!member.expiryDate) return false;
      const expiryDate = new Date(member.expiryDate);
      return expiryDate >= startOfMonth && expiryDate <= endOfMonth;
    }).length;

    // Total active members
    const totalActiveMembers = allMembers.filter(m => m.status === "active").length;

    // Get all orders this month
    const ordersSnapshot = await db.collection("orders").get();
    
    let totalOrders = 0;
    let totalRevenue = 0;

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      const orderDate = new Date(order.placedAt || order.createdAt);
      if (orderDate >= startOfMonth && orderDate <= endOfMonth) {
        totalOrders++;
        const price = parseFloat(order.totalPrice) || 0;
        totalRevenue += price;
      }
    });

    // Ensure totalRevenue is a number and round to 2 decimal places
    totalRevenue = parseFloat(totalRevenue.toFixed(2));

    res.status(200).json({
      newMembers,
      renewedMembers,
      expiredMembers,
      totalActiveMembers,
      totalOrders,
      totalRevenue,
      month: now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(400).json({ error: error.message });
  }
};