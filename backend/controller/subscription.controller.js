/**
 * Subscription Controller - Handles membership expiry, renewal, and archival
 */
import { db } from "../firebase.js";
import { sendMembershipExpiryEmail, sendReminderEmail } from "../utils/emailUtils.js";
import {
  isMembershipExpired,
  getDaysRemaining,
  getPackageDuration,
  calculateExpiryDate,
} from "../utils/packageUtils.js";

/**
 * Check and process expired memberships
 * Moves expired members to archive and sends emails
 */
export const processExpiredMemberships = async (req, res) => {
  try {
    const membersSnapshot = await db.collection("members").get();
    let expiredCount = 0;
    let emailsSent = 0;
    const errors = [];

    for (const doc of membersSnapshot.docs) {
      const member = doc.data();

      if (!member.expiryDate) continue; // Skip members without expiry date

      // Check if membership has expired
      if (isMembershipExpired(member.expiryDate)) {
        try {
          // Move to archived collection
          await db.collection("expiredMembers").doc(doc.id).set({
            ...member,
            archivedAt: new Date().toISOString(),
            previousStatus: member.status,
            status: "expired",
          });

          // Update member status to expired
          await db.collection("members").doc(doc.id).update({
            status: "expired",
            expiryProcessedAt: new Date().toISOString(),
          });

          // Send expiry email
          if (member.email) {
            try {
              await sendMembershipExpiryEmail(
                member.email,
                member.name,
                member.packageType
              );
              emailsSent++;
            } catch (emailError) {
              console.error(
                `Failed to send email to ${member.email}:`,
                emailError
              );
              errors.push({
                memberId: doc.id,
                email: member.email,
                error: emailError.message,
              });
            }
          }

          expiredCount++;
        } catch (error) {
          console.error(`Error processing member ${doc.id}:`, error);
          errors.push({
            memberId: doc.id,
            error: error.message,
          });
        }
      }
    }

    res.status(200).json({
      message: "Expired memberships processed successfully",
      expiredCount,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error processing expired memberships:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send renewal reminder emails to members expiring soon (within 7 days)
 */
export const sendExpiryReminders = async (req, res) => {
  try {
    const membersSnapshot = await db.collection("members").get();
    let remindersSent = 0;
    const errors = [];

    for (const doc of membersSnapshot.docs) {
      const member = doc.data();

      if (!member.expiryDate) continue;

      const daysRemaining = getDaysRemaining(member.expiryDate);

      // Send reminder if expiring within 7 days but not yet expired
      if (daysRemaining > 0 && daysRemaining <= 7) {
        try {
          if (member.email) {
            await sendReminderEmail(
              member.email,
              member.name,
              member.packageType,
              daysRemaining
            );
            remindersSent++;
          }
        } catch (emailError) {
          console.error(
            `Failed to send reminder to ${member.email}:`,
            emailError
          );
          errors.push({
            memberId: doc.id,
            email: member.email,
            error: emailError.message,
          });
        }
      }
    }

    res.status(200).json({
      message: "Renewal reminders sent successfully",
      remindersSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all expired members from archive
 */
export const getExpiredMembers = async (req, res) => {
  try {
    const expiredSnapshot = await db.collection("expiredMembers").get();
    const expiredMembers = [];

    expiredSnapshot.forEach((doc) => {
      expiredMembers.push({
        uid: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({
      message: "Expired members fetched successfully",
      total: expiredMembers.length,
      members: expiredMembers,
    });
  } catch (error) {
    console.error("Error fetching expired members:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Renew a member's subscription by updating expiry date
 */
export const renewMembership = async (req, res) => {
  const { memberId } = req.params;
  const { packageType } = req.body;

  if (!packageType) {
    return res.status(400).json({ error: "packageType is required" });
  }

  try {
    const newExpiryDate = calculateExpiryDate(packageType);

    // Update member in members collection
    await db.collection("members").doc(memberId).update({
      packageType,
      expiryDate: newExpiryDate.toISOString(),
      status: "active",
      lastRenewalDate: new Date().toISOString(),
    });

    // If member was in expired collection, remove them
    await db.collection("expiredMembers").doc(memberId).delete();

    res.status(200).json({
      message: "Membership renewed successfully",
      memberId,
      newPackageType: packageType,
      expiryDate: newExpiryDate.toISOString(),
    });
  } catch (error) {
    console.error("Error renewing membership:", error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get membership status for a specific member
 */
export const getMembershipStatus = async (req, res) => {
  const { memberId } = req.params;

  try {
    let memberDoc = await db.collection("members").doc(memberId).get();

    if (!memberDoc.exists) {
      // Check in expired members
      memberDoc = await db.collection("expiredMembers").doc(memberId).get();
      if (!memberDoc.exists) {
        return res.status(404).json({ error: "Member not found" });
      }
    }

    const member = memberDoc.data();
    const daysRemaining = member.expiryDate
      ? getDaysRemaining(member.expiryDate)
      : null;

    res.status(200).json({
      memberId,
      name: member.name,
      packageType: member.packageType,
      status: member.status,
      expiryDate: member.expiryDate,
      daysRemaining,
      isExpired: member.expiryDate
        ? isMembershipExpired(member.expiryDate)
        : null,
    });
  } catch (error) {
    console.error("Error fetching membership status:", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  processExpiredMemberships,
  sendExpiryReminders,
  getExpiredMembers,
  renewMembership,
  getMembershipStatus,
};
