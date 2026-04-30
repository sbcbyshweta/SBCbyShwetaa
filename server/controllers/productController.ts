import { Request, Response } from "express";
import Product from "../models/Product";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function saveDataUrlToDisk(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");

  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const base64Data = match[2];
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
  return `/uploads/${filename}`;
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log("=== CREATE PRODUCT ===");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const {
      name,
      price,
      category,
      description,
      imageUrl,
      rating,
      stock,
      colors,
      sizes,
      originalPrice,
    } = req.body;

    // Handle image - file upload, data URL, or external URL
    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      console.log("Image from file upload:", image);
    } else if (imageUrl && imageUrl.startsWith("data:image")) {
      image = saveDataUrlToDisk(imageUrl);
      console.log("Image saved from data URL:", image);
    } else if (imageUrl) {
      image = imageUrl;
      console.log("Image from external URL:", image);
    }

    // Parse colors and sizes if they're strings
    let parsedColors = ["Default"];
    let parsedSizes = ["Free Size"];

    try {
      if (colors) {
        parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
      }
      if (sizes) {
        parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      }
    } catch (e) {
      // If JSON parsing fails, treat as comma-separated string
      if (typeof colors === "string") {
        parsedColors = colors
          .split(",")
          .map((c: string) => c.trim())
          .filter(Boolean);
      }
      if (typeof sizes === "string") {
        parsedSizes = sizes
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }

    const product = await Product.create({
      name,
      price: Number(price) || 0,
      category,
      description,
      image,
      rating: Number(rating) || 5,
      stock: Number(stock) || 10,
      colors: parsedColors.length > 0 ? parsedColors : ["Default"],
      sizes: parsedSizes.length > 0 ? parsedSizes : ["Free Size"],
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
    });

    console.log("Product created successfully:", product._id);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    console.log("=== GET PRODUCTS ===");

    const { category, search } = req.query;

    let filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products`);

    res.json(products);
  } catch (error: any) {
    console.error("GET PRODUCTS ERROR:", error);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error: any) {
    console.error("GET PRODUCT ERROR:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    console.log("=== UPDATE PRODUCT ===");
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { id } = req.params;

    const {
      name,
      price,
      category,
      description,
      imageUrl,
      rating,
      stock,
      colors,
      sizes,
      originalPrice,
    } = req.body;

    // Handle image update - file upload, data URL, or external URL
    let image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      console.log("Image from file upload:", image);
    } else if (imageUrl && imageUrl.startsWith("data:image")) {
      image = saveDataUrlToDisk(imageUrl);
      console.log("Image saved from data URL:", image);
    } else if (imageUrl) {
      image = imageUrl;
      console.log("Image from external URL:", image);
    }

    // Parse colors and sizes
    let parsedColors;
    let parsedSizes;

    try {
      parsedColors = colors
        ? typeof colors === "string"
          ? JSON.parse(colors)
          : colors
        : undefined;
      parsedSizes = sizes
        ? typeof sizes === "string"
          ? JSON.parse(sizes)
          : sizes
        : undefined;
    } catch (e) {
      if (typeof colors === "string") {
        parsedColors = colors
          .split(",")
          .map((c: string) => c.trim())
          .filter(Boolean);
      }
      if (typeof sizes === "string") {
        parsedSizes = sizes
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }

    const updateData: any = {
      name,
      price: Number(price) || 0,
      category,
      description,
      rating: Number(rating) || 5,
      stock: Number(stock) || 10,
    };

    if (parsedColors) updateData.colors = parsedColors;
    if (parsedSizes) updateData.sizes = parsedSizes;
    if (originalPrice) updateData.originalPrice = Number(originalPrice);
    if (image) updateData.image = image;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product updated:", product._id);
    res.json({ success: true, message: "Product updated", product });
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};
