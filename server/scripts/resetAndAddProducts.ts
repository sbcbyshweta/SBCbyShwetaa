import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://sbcbyshwetaa123:shwetaa123@sbc-cluster.fzlrywm.mongodb.net/sbc-backend";

const productSchema = new mongoose.Schema({}, { strict: false });

async function addTestProduct() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!\n");

    const Product = mongoose.model("Product", productSchema);

    // Delete all existing products first
    console.log("🗑️  Deleting existing products...");
    await Product.deleteMany({});
    console.log("✅ All products deleted\n");

    // Create 3 sample products WITH REAL IMAGES
    console.log("📝 Creating sample products...\n");

    const products = [
      {
        name: "Premium Kanhaji Silk Dress",
        description:
          "Premium hand-woven silk dress for Laddu Gopal, featuring intricate golden zari work and a soft cotton lining for comfort. Perfect for festivals and daily shringar.",
        price: 2499,
        originalPrice: 3499,
        category: "kanha-ji-dresses",
        image:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
        rating: 4.8,
        stock: 15,
        colors: ["Deep Saffron", "Royal Gold", "Maroon"],
        sizes: ["Free Size", "Small", "Medium", "Large"],
        reviews: 24,
        featured: true,
      },
      {
        name: "Divine Banarasi Silk Saree",
        description:
          "Exquisite Banarasi silk saree with traditional golden zari work. Perfect for weddings and special occasions. Handwoven by master artisans.",
        price: 5999,
        originalPrice: 8999,
        category: "sarees",
        image:
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop",
        rating: 4.9,
        stock: 8,
        colors: ["Red & Gold", "Maroon & Silver", "Peach & Gold"],
        sizes: ["Free Size"],
        reviews: 45,
        featured: true,
      },
      {
        name: "Premium Kundan Jewelry Set",
        description:
          "Complete Kundan jewelry set including necklace, earrings, and maang tikka. Perfect for festive occasions and weddings.",
        price: 1999,
        originalPrice: 2999,
        category: "other-products",
        image:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop",
        rating: 4.7,
        stock: 20,
        colors: ["Gold", "Rose Gold"],
        sizes: ["Free Size"],
        reviews: 67,
        featured: true,
      },
      {
        name: "Golden Rajwadi Kanhaji Dress",
        description:
          "Exquisite Rajwadi design with golden embroidery and premium fabric. Perfect for special occasions and festivals.",
        price: 1899,
        originalPrice: 2499,
        category: "kanha-ji-dresses",
        image:
          "https://images.unsplash.com/photo-1617179783962-19c565cfb126?w=600&h=800&fit=crop",
        rating: 4.7,
        stock: 12,
        colors: ["Gold", "Maroon", "Navy Blue"],
        sizes: ["Free Size", "Small", "Medium", "Large", "XL"],
        reviews: 38,
        featured: true,
      },
      {
        name: "Royal Patola Silk Saree",
        description:
          "Elegant royal blue Patola saree with traditional patterns. Beautiful for festivals and ceremonies.",
        price: 4999,
        originalPrice: 6499,
        category: "sarees",
        image:
          "https://images.unsplash.com/photo-1623883626032-e5c2f63c95e8?w=600&h=800&fit=crop",
        rating: 4.6,
        stock: 7,
        colors: ["Royal Blue", "Navy Blue", "Purple"],
        sizes: ["Free Size"],
        reviews: 29,
        featured: true,
      },
    ];

    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created: ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Image: ${product.image ? "✅" : "❌"}`);
      console.log("");
    }

    // Verify by fetching all
    const allProducts = await Product.find({});
    console.log("=".repeat(60));
    console.log(`\n✅ SUCCESS! ${allProducts.length} products created!\n`);

    console.log("📦 Products List:");
    console.log("-".repeat(60));
    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Price: ₹${p.price}`);
      console.log(`   Image: ${p.image ? "✅" : "❌"}`);
      console.log("");
    });

    console.log("=".repeat(60));
    console.log("\n🚀 READY TO TEST!");
    console.log("\nStart servers and check:");
    console.log("1. Home page - Products should appear");
    console.log("2. Category pages - Products filter correctly");
    console.log("3. Admin panel - All products visible");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  }
}

addTestProduct();
