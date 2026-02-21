
import cron from "node-cron";
import { db } from "../firebase.js";
import { sendMembershipExpiryEmail, sendReminderEmail } from "../utils/emailUtils.js";
import {
  isMembershipExpired,
  getDaysRemaining,
} from "../utils/packageUtils.js";

export const initializeCronJobs = () => {
  console.log("📅 Initializing cron jobs...");

  cron.schedule("0 2 * * *", async () => {
    console.log("🔔 Running daily expiry check...");
    await checkAndProcessExpiredMemberships();
  });

  cron.schedule("0 9 * * *", async () => {
    console.log("📧 Sending renewal reminders...");
    await sendRemindersToExpiringMembers();
  });

  console.log("✅ Cron jobs initialized successfully");
};

export const checkAndProcessExpiredMemberships = async () => {
  try {
    const membersSnapshot = await db.collection("members").get();
    let processedCount = 0;
    let emailsSent = 0;

    for (const doc of membersSnapshot.docs) {
      const member = doc.data();

      if (!member.expiryDate) continue;

      if (isMembershipExpired(member.expiryDate)) {
        try {
          
          await db.collection("expiredMembers").doc(doc.id).set({
            ...member,
            archivedAt: new Date().toISOString(),
            previousStatus: member.status,
            status: "expired",
          });

          await db.collection("members").doc(doc.id).update({
            status: "expired",
            expiryProcessedAt: new Date().toISOString(),
          });

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

export const sendRemindersToExpiringMembers = async () => {
  try {
    const membersSnapshot = await db.collection("members").get();
    let remindersSent = 0;

    for (const doc of membersSnapshot.docs) {
      const member = doc.data();

      if (!member.expiryDate) continue;

      const daysRemaining = getDaysRemaining(member.expiryDate);

      if (daysRemaining > 0 && daysRemaining <= 7) {
        try {
          if (member.email) {
            
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
