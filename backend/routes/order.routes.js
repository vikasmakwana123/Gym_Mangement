import express from "express";
import {
  placeOrder,
  getOrdersByMember,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controller/order.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/place-order", placeOrder);

router.get("/member/:memberId", getOrdersByMember);

router.get("/all", checkAdmin, getAllOrders);

router.get("/:orderId", getOrderById);

router.put("/:orderId/status", checkAdmin, updateOrderStatus);

router.delete("/:orderId", checkAdmin, deleteOrder);

export default router;
