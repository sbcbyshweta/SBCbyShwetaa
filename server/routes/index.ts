import express from "express"

import authRoutes from "./authRoutes"
import productRoutes from "./productRoutes"
import orderRoutes from "./orderRoutes"
import adminRoutes from "./adminRoutes"
const router = express.Router()

router.use("/auth", authRoutes)
router.use("/products", productRoutes)
router.use("/orders", orderRoutes)
router.use("/admin",adminRoutes)

export default router