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

// Place order (Members only - no special middleware needed, just needs auth)
router.post("/place-order", placeOrder);

// Get orders by member
router.get("/member/:memberId", getOrdersByMember);

// Get all orders (Admin only)
router.get("/all", checkAdmin, getAllOrders);

// Get single order
router.get("/:orderId", getOrderById);

// Update order status (Admin only)
router.put("/:orderId/status", checkAdmin, updateOrderStatus);

// Delete order (Admin only)
router.delete("/:orderId", checkAdmin, deleteOrder);

export default router;
