import express from "express"

import {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct
} from "../controllers/productController"

import { authMiddleware } from "../middleware/authMiddleware"
import { upload } from "../middleware/uploadMiddleware"

const router = express.Router()

// GET ALL PRODUCTS
router.get("/", getProducts)

// GET SINGLE PRODUCT
router.get("/:id", getProductById)

// CREATE PRODUCT
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createProduct
)

// DELETE PRODUCT
router.delete(
  "/:id",
  authMiddleware,
  deleteProduct
)

// UPDATE PRODUCT
router.put(
  "/:id",
  authMiddleware,
  updateProduct
)

export default router