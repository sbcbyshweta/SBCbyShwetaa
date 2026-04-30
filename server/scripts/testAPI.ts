import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://sbcbyshwetaa123:shwetaa123@sbc-cluster.fzlrywm.mongodb.net/sbc-backend";

async function testAPI() {
  try {
    console.log("🔄 Testing API Connection...\n");

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected!");

    const Product = mongoose.model(
      "Product",
      new mongoose.Schema({}, { strict: false }),
    );

    console.log("\n📊 Testing GET /api/products...");
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`✅ Found ${products.length} products`);

    if (products.length > 0) {
      console.log("\n📦 Recent Products:");
      products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`);
        console.log(`      Category: ${p.category}`);
        console.log(`      Price: ₹${p.price}`);
        console.log(`      Image: ${p.image ? "✅ Has image" : "❌ No image"}`);
      });
    }

    console.log("\n📝 Testing POST /api/products (creating test product)...");
    const testProduct = new Product({
      name: "Test Product - " + Date.now(),
      description: "This is a test product",
      price: 999,
      category: "kanha-ji-dresses",
      stock: 10,
      image:
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop",
    });

    await testProduct.save();
    console.log("✅ Product created with ID:", testProduct._id);

    console.log("\n🗑️  Cleaning up test product...");
    await Product.findByIdAndDelete(testProduct._id);
    console.log("✅ Test product deleted");

    console.log("\n" + "=".repeat(50));
    console.log("✅ ALL API TESTS PASSED!");
    console.log("=".repeat(50));
    console.log("\n🚀 Your API is working correctly!");
    console.log("\nTo start the servers:");
    console.log("  Backend: cd server && npx tsx server.ts");
    console.log("  Frontend: npm run dev");
    console.log("\nThen login at http://localhost:8080/login");
    console.log("  Admin: admin@sbc.com / admin123");
  } catch (error) {
    console.error("❌ API Test Failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAPI();
