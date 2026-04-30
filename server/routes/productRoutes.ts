import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
} from "../controllers/productController";
import { upload } from "../middleware/uploadMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authMiddleware, upload.single("image"), createProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.put("/:id", authMiddleware, upload.single("image"), updateProduct);

export default router;
