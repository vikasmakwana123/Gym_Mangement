// routes/auth.routes.js
import express from "express";
import dotenv from "dotenv";
import { LoginController } from "../controller/auth.controller.js";
import { createAdminAccount } from "../controller/admin.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";
import  CreateUserController  from "../controller/UserSignup.controller.js"; // if you have this

dotenv.config();

const router = express.Router(); // ✅ Correct way

// Routes
router.post("/login", LoginController);
router.post("/register", CreateUserController);
router.post("/create-admin", createAdminAccount);

export default router;
