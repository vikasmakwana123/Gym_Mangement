/**
 * Subscription Routes - Handle membership expiry, renewals, and archival
 */
import express from "express";
import {
  processExpiredMemberships,
  sendExpiryReminders,
  getExpiredMembers,
  renewMembership,
  getMembershipStatus,
} from "../controller/subscription.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/**
 * Process and archive all expired memberships
 * POST /subscription/process-expired
 * Admin only
 */
router.post("/process-expired", checkAdmin, processExpiredMemberships);

/**
 * Send renewal reminder emails to members expiring within 7 days
 * POST /subscription/send-reminders
 * Admin only
 */
router.post("/send-reminders", checkAdmin, sendExpiryReminders);

/**
 * Get all expired members
 * GET /subscription/expired-members
 * Admin only
 */
router.get("/expired-members", checkAdmin, getExpiredMembers);

/**
 * Renew a member's subscription
 * PUT /subscription/renew/:memberId
 * Admin or Member themselves
 */
router.put("/renew/:memberId", renewMembership);

/**
 * Get membership status for a specific member
 * GET /subscription/status/:memberId
 */
router.get("/status/:memberId", getMembershipStatus);

export default router;
