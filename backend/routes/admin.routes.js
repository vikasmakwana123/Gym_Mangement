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

router.get("/supplements", GetSupplements);

router.post("/add-supplement", upload.single("image"), AddSuppliments);

router.post("/members/add", checkAdmin, addNewMember);
router.get("/members", checkAdmin, getAllMembers);
router.put("/members/:memberId", checkAdmin, updateMember);
router.delete("/members/:memberId", checkAdmin, deleteMember);
router.put("/members/:memberId/renew", checkAdmin, renewMembership);
router.get("/stats", checkAdmin, getAdminStats);

export default router;
