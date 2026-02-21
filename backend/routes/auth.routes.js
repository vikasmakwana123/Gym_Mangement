
import express from "express";
import dotenv from "dotenv";
import { LoginController, getUserInfo } from "../controller/auth.controller.js";
import { 
  createAdminAccount, 
} from "../controller/admin.controller.js";

import CreateUserController from "../controller/UserSignup.controller.js"; 

dotenv.config();

const router = express.Router(); 

router.post("/login", LoginController);
router.post("/register", CreateUserController);
router.post("/create-admin", createAdminAccount);
router.get("/user/:uid", getUserInfo);

export default router;
