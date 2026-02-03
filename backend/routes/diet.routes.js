import express from "express";
import { checkAdmin } from "../middleware/admin.middleware.js";
import { 
  addUpdateDiet, 
  getDietDetails, 
  getAllMembersForDiet 
} from "../controller/diet.controller.js";

const router = express.Router();

// Get all members for diet management (Admin only)
router.get("/members", checkAdmin, getAllMembersForDiet);

// Add or update diet details for a member (Admin only)
router.post("/add", checkAdmin, addUpdateDiet);

// Get diet details for a specific member (Admin only)
router.get("/:memberId", checkAdmin, getDietDetails);

export default router;
