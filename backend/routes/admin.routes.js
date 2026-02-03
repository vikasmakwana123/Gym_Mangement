import express from "express";
import { AddSuppliments, GetSupplements } from "../controller/suppliment.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { checkAdmin } from "../middleware/admin.middleware.js";
import { 
  addNewMember, 
  getAllMembers, 
  updateMember, 
  deleteMember,
  renewMembership,
  getAdminStats
} from "../controller/admin.controller.js";

const router = express.Router();

// Get all supplements
router.get("/supplements", GetSupplements);

// Use Multer middleware for single image upload
router.post("/add-supplement", upload.single("image"), AddSuppliments);


// Member management routes (Admin only)
router.post("/members/add", checkAdmin, addNewMember);
router.get("/members", checkAdmin, getAllMembers);
router.put("/members/:memberId", checkAdmin, updateMember);
router.delete("/members/:memberId", checkAdmin, deleteMember);
router.put("/members/:memberId/renew", checkAdmin, renewMembership);
router.get("/stats", checkAdmin, getAdminStats);


export default router;
