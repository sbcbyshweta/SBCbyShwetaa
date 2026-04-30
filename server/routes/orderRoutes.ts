import express from "express";
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
} from "../controllers/orderController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", createOrder);

router.get("/", authMiddleware, getOrders);

router.get("/my", getMyOrders);

router.get("/my/:id", getOrderById);

router.put("/:id", authMiddleware, updateOrderStatus);

router.delete("/:id", authMiddleware, deleteOrder);

router.put("/:id/status", authMiddleware, updateOrderStatus);

router.put("/cancel/:id", cancelOrder);

export default router;
