/**
 * Cron Jobs for automated membership expiry checking
 * Runs scheduled tasks to process expired memberships and send reminders
 */
import cron from "node-cron";
import { db } from "../firebase.js";
import { sendMembershipExpiryEmail, sendReminderEmail } from "../utils/emailUtils.js";
import {
  isMembershipExpired,
  getDaysRemaining,
} from "../utils/packageUtils.js";

/**
 * Initialize all cron jobs
 * Call this function in your main server file (index.js)
 */
export const initializeCronJobs = () => {
  console.log("📅 Initializing cron jobs...");

  // Run expiry check every day at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("🔔 Running daily expiry check...");
    await checkAndProcessExpiredMemberships();
  });

  // Send reminders every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("📧 Sending renewal reminders...");
    await sendRemindersToExpiringMembers();
  });

  console.log("✅ Cron jobs initialized successfully");
};

/**
 * Check and process expired memberships
 * Archives expired members and sends notification emails
 */
export const checkAndProcessExpiredMemberships = async () => {
  try {
    const membersSnapshot = await db.collection("members").get();
    let processedCount = 0;
    let emailsSent = 0;

    for (const doc of membersSnapshot.docs) {
      const member = doc.data();

      if (!member.expiryDate) continue;

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
                emailError.message
              );
            }
          }

          processedCount++;
        } catch (error) {
          console.error(`Error processing member ${doc.id}:`, error.message);
        }
      }
    }

    console.log(
      `✅ Expiry check complete: ${processedCount} members processed, ${emailsSent} emails sent`
    );
  } catch (error) {
    console.error("❌ Error during expiry check:", error.message);
  }
};

/**
 * Send renewal reminders to members expiring soon (within 7 days)
 */
export const sendRemindersToExpiringMembers = async () => {
  try {
    const membersSnapshot = await db.collection("members").get();
    let remindersSent = 0;

    for (const doc of membersSnapshot.docs) {
      const member = doc.data();

      if (!member.expiryDate) continue;

      const daysRemaining = getDaysRemaining(member.expiryDate);

      // Send reminder if expiring within 7 days but not yet expired
      if (daysRemaining > 0 && daysRemaining <= 7) {
        try {
          if (member.email) {
            // Check if reminder was already sent today
            const today = new Date().toDateString();
            if (
              !member.lastReminderSentDate ||
              new Date(member.lastReminderSentDate).toDateString() !== today
            ) {
              await sendReminderEmail(
                member.email,
                member.name,
                member.packageType,
                daysRemaining
              );

              // Update last reminder sent date
              await db.collection("members").doc(doc.id).update({
                lastReminderSentDate: new Date().toISOString(),
              });

              remindersSent++;
            }
          }
        } catch (emailError) {
          console.error(
            `Failed to send reminder to ${member.email}:`,
            emailError.message
          );
        }
      }
    }

    console.log(`✅ Reminder check complete: ${remindersSent} reminders sent`);
  } catch (error) {
    console.error("❌ Error sending reminders:", error.message);
  }
};

export default { initializeCronJobs, checkAndProcessExpiredMemberships, sendRemindersToExpiringMembers };
