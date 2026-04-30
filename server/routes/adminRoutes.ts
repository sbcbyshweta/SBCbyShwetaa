import express from "express";
import { getDashboardStats } from "../controllers/adminController";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboardStats);

router.get("/orders", authMiddleware, getOrders);

router.put("/orders/:id/status", authMiddleware, updateOrderStatus);

router.delete("/orders/:id", authMiddleware, deleteOrder);

export default router;
