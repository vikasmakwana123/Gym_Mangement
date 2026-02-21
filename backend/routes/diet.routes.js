import express from "express";
import { checkAdmin } from "../middleware/admin.middleware.js";
import { 
  addUpdateDiet, 
  getDietDetails, 
  getAllMembersForDiet 
} from "../controller/diet.controller.js";

const router = express.Router();

router.get("/members", checkAdmin, getAllMembersForDiet);

router.post("/add", checkAdmin, addUpdateDiet);

router.get("/:memberId", checkAdmin, getDietDetails);

export default router;
