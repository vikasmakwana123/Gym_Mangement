
import { db } from "../firebase.js";
import { isMembershipExpired } from "../utils/packageUtils.js";

export const checkActiveMembership = async (req, res, next) => {
  try {
    const { uid } = req.body || req.params || req.query;

    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const memberDoc = await db.collection("members").doc(uid).get();

    if (!memberDoc.exists) {
      return res.status(404).json({
        error: "Member not found",
        suggestion: "Please sign up first",
      });
    }

    const member = memberDoc.data();

    if (member.expiryDate && isMembershipExpired(member.expiryDate)) {
      return res.status(403).json({
        error: "Membership expired",
        status: "expired",
        expiryDate: member.expiryDate,
        message: "Your membership has expired. Please renew to continue.",
      });
    }

    if (member.status !== "active") {
      return res.status(403).json({
        error: "Membership inactive",
        status: member.status,
        message: `Your membership is ${member.status}. Contact admin for assistance.`,
      });
    }

    req.member = member;
    req.userId = uid;

    next();
  } catch (error) {
    console.error("Error in checkActiveMembership middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkMembershipStatus = async (req, res, next) => {
  try {
    const { uid } = req.body || req.params || req.query;

    if (!uid) {
      return next(); 
    }

    const memberDoc = await db.collection("members").doc(uid).get();

    if (memberDoc.exists) {
      const member = memberDoc.data();
      
      req.member = member;
      req.userId = uid;
      
      if (member.expiryDate) {
        const now = new Date();
        const expiry = new Date(member.expiryDate);
        const daysRemaining = Math.ceil(
          (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        req.membershipWarning = null;

        if (daysRemaining < 0) {
          req.membershipWarning = {
            type: "expired",
            message: "Your membership has expired. Renew to regain access.",
            daysRemaining,
          };
        } else if (daysRemaining <= 7) {
          req.membershipWarning = {
            type: "expiring-soon",
            message: `Your membership expires in ${daysRemaining} days.`,
            daysRemaining,
          };
        } else if (daysRemaining <= 14) {
          req.membershipWarning = {
            type: "renewal-reminder",
            message: `Your membership expires in ${daysRemaining} days. Renew soon.`,
            daysRemaining,
          };
        }
      }
    }

    next();
  } catch (error) {
    console.error("Error in checkMembershipStatus middleware:", error);
    next(); 
  }
};

export const checkPremiumFeature = (allowedPackages) => {
  return async (req, res, next) => {
    try {
      const member = req.member;

      if (!member) {
        return res.status(401).json({ error: "Member not authenticated" });
      }

      if (!allowedPackages.includes(member.packageType)) {
        return res.status(403).json({
          error: "Upgrade required",
          message: `This feature is only available for ${allowedPackages.join(", ")} members.`,
          currentPackage: member.packageType,
          requiredPackages: allowedPackages,
        });
      }

      next();
    } catch (error) {
      console.error("Error in checkPremiumFeature middleware:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};

export default {
  checkActiveMembership,
  checkMembershipStatus,
  checkPremiumFeature,
};
