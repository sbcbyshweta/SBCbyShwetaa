import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://sbcbyshwetaa123:shwetaa123@sbc-cluster.fzlrywm.mongodb.net/sbc-backend";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true },
    image: { type: String },
    rating: { type: Number, default: 5 },
    stock: { type: Number, default: 10 },
    colors: { type: [String], default: ["Deep Saffron", "Royal Gold"] },
    sizes: { type: [String], default: ["Free Size"] },
    reviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    needsImage: { type: Boolean, default: true },
  },
  { timestamps: true },
);

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const Product = mongoose.model("Product", productSchema);

    // Clear all existing products for fresh start
    console.log("\n🗑️  Clearing existing products...");
    await Product.deleteMany({});

    // Create products WITHOUT hardcoded images
    // Admin must upload actual product photo and use AI to generate professional images

    const products = [
      {
        name: "Kanhaji Silk Dress",
        description:
          "Premium hand-woven silk dress for Laddu Gopal, featuring intricate golden zari work and a soft cotton lining for comfort. Perfect for festivals and daily shringar. This dress combines traditional craftsmanship with a royal aesthetic.",
        price: 2499,
        originalPrice: 3499,
        category: "kanha-ji-dresses",
        image: null, // MUST BE UPLOADED - Use AI Generator to create professional image
        rating: 4.8,
        stock: 15,
        colors: ["Deep Saffron", "Royal Gold", "Maroon"],
        sizes: ["Free Size", "Small", "Medium", "Large"],
        reviews: 24,
        featured: true,
        needsImage: true,
      },
      {
        name: "Divine Banarasi Silk Saree",
        description:
          "Exquisite Banarasi silk saree with traditional golden zari work. Perfect for weddings and special occasions. Handwoven by master artisans.",
        price: 5999,
        originalPrice: 8999,
        category: "sarees",
        image: null, // MUST BE UPLOADED
        rating: 4.9,
        stock: 8,
        colors: ["Red & Gold", "Maroon & Silver"],
        sizes: ["Free Size"],
        reviews: 45,
        featured: true,
        needsImage: true,
      },
      {
        name: "Premium Kundan Set",
        description:
          "Complete Kundan jewelry set including necklace, earrings, and maang tikka. Perfect for festive occasions and weddings.",
        price: 1999,
        originalPrice: 2999,
        category: "other-products",
        image: null, // MUST BE UPLOADED
        rating: 4.7,
        stock: 20,
        colors: ["Gold", "Rose Gold"],
        sizes: ["Free Size"],
        reviews: 67,
        featured: true,
        needsImage: true,
      },
    ];

    console.log("\n📝 Creating products WITHOUT images (admin must upload):\n");

    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created: ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Image: ⏳ PENDING UPLOAD`);
      console.log("");
    }

    console.log("=".repeat(60));
    console.log("\n📌 HOW TO ADD PRODUCT IMAGES:");
    console.log("=".repeat(60));
    console.log(`
1. Login to Admin Panel (admin@sbc.com / admin123)
2. Go to Admin Dashboard
3. Click "Add Product" or Edit existing product
4. Upload your ACTUAL product photo
5. OR click "AI Generate" to create professional images
6. The AI will use YOUR uploaded photo to generate:
   - For Kanha Ji Dresses: Laddu Gopal wearing YOUR dress
   - For Sarees: sbcbyshweta girl wearing YOUR saree

⚠️  IMPORTANT: Every product MUST have its own unique image!
   - Upload the REAL photo of your product
   - Don't use generic/stock images
   - AI will enhance YOUR product photo
`);
    console.log("=".repeat(60));

    // List all products
    const allProducts = await Product.find({}).sort({ category: 1 });
    console.log("\n📦 Products in Database:");
    console.log("-".repeat(60));

    allProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Image: ${product.image ? "✅" : "⏳ PENDING"}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log(`Total products: ${allProducts.length}`);
    console.log("\n✅ Database reset complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
