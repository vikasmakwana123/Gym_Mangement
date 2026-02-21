
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

router.post("/process-expired", checkAdmin, processExpiredMemberships);

router.post("/send-reminders", checkAdmin, sendExpiryReminders);

router.get("/expired-members", checkAdmin, getExpiredMembers);

router.put("/renew/:memberId", renewMembership);

router.get("/status/:memberId", getMembershipStatus);

export default router;
