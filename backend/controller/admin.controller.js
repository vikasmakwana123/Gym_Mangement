
import { auth, db } from "../firebase.js"; 
import { calculateExpiryDate, getPackageDetails } from "../utils/packageUtils.js";

export const createAdminAccount = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role: "admin",   
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

export const addNewMember = async (req, res) => {
  const { email, password, name, packageType } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ 
      error: "Email, password, and name are required" 
    });
  }

  try {
    
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const selectedPackage = packageType || "basic";
    const expiryDate = calculateExpiryDate(selectedPackage);
    const packageDetails = getPackageDetails(selectedPackage);

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

export const deleteMember = async (req, res) => {
  const { memberId } = req.params;

  try {
    
    await db.collection("members").doc(memberId).delete();
    
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

export const renewMembership = async (req, res) => {
  const { memberId } = req.params;
  const { packageType } = req.body;

  try {
    if (!packageType) {
      return res.status(400).json({ error: "Package type is required" });
    }

    const memberSnapshot = await db.collection("members").doc(memberId).get();
    if (!memberSnapshot.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberSnapshot.data();

    const expiryDate = calculateExpiryDate(packageType);
    const packageDetails = getPackageDetails(packageType);

    await db.collection("members").doc(memberId).update({
      packageType,
      expiryDate: expiryDate.toISOString(),
      status: "active",
      updatedAt: new Date().toISOString(),
    });

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

export const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const membersSnapshot = await db.collection("members").get();
    const allMembers = membersSnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    }));

    const newMembers = allMembers.filter(member => {
      const createdDate = new Date(member.createdAt);
      return createdDate >= startOfMonth && createdDate <= endOfMonth;
    }).length;

    const renewedMembers = allMembers.filter(member => {
      const updatedDate = new Date(member.updatedAt || member.createdAt);
      return updatedDate >= startOfMonth && updatedDate <= endOfMonth &&
             updatedDate.getTime() !== new Date(member.createdAt).getTime() &&
             member.status === "active";
    }).length;

    const expiredMembers = allMembers.filter(member => {
      if (!member.expiryDate) return false;
      const expiryDate = new Date(member.expiryDate);
      return expiryDate >= startOfMonth && expiryDate <= endOfMonth;
    }).length;

    const totalActiveMembers = allMembers.filter(m => m.status === "active").length;

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
