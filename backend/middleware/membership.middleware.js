/**
 * Membership Validation Middleware
 * Checks if a user's membership is active and not expired
 */
import { db } from "../firebase.js";
import { isMembershipExpired } from "../utils/packageUtils.js";

/**
 * Middleware to check if member's subscription is active
 * Prevents expired members from accessing gym facilities
 */
export const checkActiveMembership = async (req, res, next) => {
  try {
    const { uid } = req.body || req.params || req.query;

    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if member exists and is active
    const memberDoc = await db.collection("members").doc(uid).get();

    if (!memberDoc.exists) {
      return res.status(404).json({
        error: "Member not found",
        suggestion: "Please sign up first",
      });
    }

    const member = memberDoc.data();

    // Check if membership is expired
    if (member.expiryDate && isMembershipExpired(member.expiryDate)) {
      return res.status(403).json({
        error: "Membership expired",
        status: "expired",
        expiryDate: member.expiryDate,
        message: "Your membership has expired. Please renew to continue.",
      });
    }

    // Check if member status is active
    if (member.status !== "active") {
      return res.status(403).json({
        error: "Membership inactive",
        status: member.status,
        message: `Your membership is ${member.status}. Contact admin for assistance.`,
      });
    }

    // Attach member data to request for use in route handlers
    req.member = member;
    req.userId = uid;

    next();
  } catch (error) {
    console.error("Error in checkActiveMembership middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Middleware to check membership status and warn if expiring soon
 * Allows access but includes warning in response
 */
export const checkMembershipStatus = async (req, res, next) => {
  try {
    const { uid } = req.body || req.params || req.query;

    if (!uid) {
      return next(); // Continue if no uid provided
    }

    // Check member details
    const memberDoc = await db.collection("members").doc(uid).get();

    if (memberDoc.exists) {
      const member = memberDoc.data();
      
      // Attach member data to request
      req.member = member;
      req.userId = uid;
      
      // Add membership warning if expiring soon
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
    next(); // Continue even if error occurs
  }
};

/**
 * Middleware to check if member has premium features
 * Based on package type
 */
export const checkPremiumFeature = (allowedPackages) => {
  return async (req, res, next) => {
    try {
      const member = req.member;

      if (!member) {
        return res.status(401).json({ error: "Member not authenticated" });
      }

      // Check if member's package allows this feature
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
