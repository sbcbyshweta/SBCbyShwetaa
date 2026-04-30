import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MOCK_MODE = false; // Set to false when MongoDB is configured

export const connectDB = async () => {
  if (MOCK_MODE) {
    console.log("Running in mock mode - using local data");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected Successfully");

    // Seed data after connection
    await seedData();
  } catch (error) {
    console.error("Database connection failed, falling back to mock mode");
  }
};

export const isMockMode = () => MOCK_MODE;

async function seedData() {
  const User = (await import("../models/User")).default;
  const Product = (await import("../models/Product")).default;

  // Check if admin exists, if not create one
  const adminExists = await User.findOne({ role: "admin" });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@sbc.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Admin user created: admin@sbc.com / admin123");
  }

  // Seed products if none exist
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      {
        name: "Peacock Feather Dress",
        price: 1499,
        originalPrice: 1999,
        image:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop",
        category: "kanha-ji-dresses",
        description:
          "Divine dress with peacock feather embroidery, perfect for Lord Krishna celebrations",
        rating: 4.5,
        stock: 10,
        colors: ["Navy Blue", "Gold", "White"],
        sizes: ["S", "M", "L", "XL"],
      },
      {
        name: "Golden Rajwadi Dress",
        price: 1699,
        originalPrice: 2199,
        image:
          "https://images.unsplash.com/photo-1617179783962-19c565cfb126?w=500&h=600&fit=crop",
        category: "kanha-ji-dresses",
        description:
          "Exquisite Rajwadi design with golden embroidery and premium fabric",
        rating: 4.7,
        stock: 8,
        colors: ["Gold", "Maroon"],
        sizes: ["S", "M", "L", "XL", "XXL"],
      },
      {
        name: "Red Kanjivaram Silk Saree",
        price: 5999,
        originalPrice: 7999,
        image:
          "https://images.unsplash.com/photo-1505299726314-52581ce3e44a?w=500&h=600&fit=crop",
        category: "sarees",
        description:
          "Traditional red Kanjivaram silk saree with intricate zari work",
        rating: 4.9,
        stock: 5,
        colors: ["Red", "Maroon"],
      },
      {
        name: "Royal Blue Patola Saree",
        price: 4999,
        originalPrice: 6499,
        image:
          "https://images.unsplash.com/photo-1623883626032-e5c2f63c95e8?w=500&h=600&fit=crop",
        category: "sarees",
        description:
          "Elegant royal blue Patola saree with traditional patterns",
        rating: 4.6,
        stock: 7,
        colors: ["Blue", "Navy Blue"],
      },
      {
        name: "Gold Plated Bangles Set",
        price: 1299,
        originalPrice: 1799,
        image:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=600&fit=crop",
        category: "other-products",
        description:
          "Beautiful gold plated bangles set with traditional design",
        rating: 4.4,
        stock: 20,
        colors: ["Gold", "Rose Gold"],
      },
      {
        name: "Pearl Necklace Set",
        price: 1999,
        originalPrice: 2699,
        image:
          "https://images.unsplash.com/photo-1599643478584-15054e929fc0?w=500&h=600&fit=crop",
        category: "other-products",
        description: "Elegant pearl necklace set with matching earrings",
        rating: 4.7,
        stock: 15,
        colors: ["White", "Cream"],
      },
    ]);
    console.log("Sample products seeded!");
  }
}
