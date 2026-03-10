import express from "express"
import {
createOrder,
getOrders,
updateOrderStatus,
deleteOrder
} from "../controllers/orderController"

import {authMiddleware} from "../middleware/authMiddleware"

const router = express.Router()

router.post("/", createOrder)

router.get("/", authMiddleware, getOrders)

router.put("/:id", authMiddleware, updateOrderStatus)

router.delete("/:id", authMiddleware, deleteOrder)

router.put("/:id/status",authMiddleware,updateOrderStatus)

export default router