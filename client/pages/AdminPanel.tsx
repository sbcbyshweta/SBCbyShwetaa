import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AIImageGenerator from "@/components/AIImageGenerator";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE = "https://sbc-backend-u2sm.onrender.com/api";
const IMAGE_BASE = "https://sbc-backend-u2sm.onrender.com/uploads";

/* ================= PRODUCT TYPE ================= */

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: "kanha-ji-dresses" | "sarees" | "other-products";
  image: string;
  rating: number;
  stock: number;

  id?: string;
  sku?: string;
  colors?: string[];
  sizes?: string[];
  reviews?: number;
  originalPrice?: number;
  inStock?: boolean;
}

/* ================= CATEGORY LABELS ================= */

const categoryLabels: Record<string, string> = {
  "kanha-ji-dresses": "Kanha Ji Dresses",
  "sarees": "Sarees",
  "other-products": "Other Products",
};

/* ================= PRICE FORMAT ================= */

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString("en-IN")}`;
};

export default function AdminPanel() {

  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    price: number;
    description: string;
    category: "kanha-ji-dresses" | "sarees" | "other-products";
  }>({
    name: "",
    price: 0,
    description: "",
    category: "kanha-ji-dresses",
  });

  /* ================= FETCH PRODUCTS ================= */

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();

      const normalized = data.map((p: any) => ({
        ...p,
        id: p._id,
        reviews: p.reviews ?? Math.floor(Math.random() * 150),
        colors: p.colors ?? ["Default"],
        sizes: p.sizes ?? ["Free Size"],
        originalPrice: p.originalPrice ?? p.price,
        inStock: p.stock > 0,
      }));

      setProducts(normalized);

    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= FILTER PRODUCTS ================= */

  const filteredProducts = products.filter((product) => {

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  /* ================= ADD PRODUCT ================= */

  const handleAddProduct = async () => {

    const token = localStorage.getItem("token");

    if (!formData.name || !formData.price) {
      alert("Please fill required fields");
      return;
    }

    try {

      const form = new FormData();

      form.append("name", formData.name);
      form.append("price", String(formData.price));
      form.append("description", formData.description);
      form.append("category", formData.category);
      form.append("rating", "5");
      form.append("stock", "10");

      if (generatedImage) {
        form.append("image", generatedImage);
      }

      await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      fetchProducts();
      resetForm();
      setShowAddForm(false);

    } catch (error) {
      console.error("Add product error:", error);
    }
  };

  /* ================= DELETE PRODUCT ================= */

  const handleDeleteProduct = async (id: string) => {

    const token = localStorage.getItem("token");

    if (!window.confirm("Delete this product?")) return;

    try {

      await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProducts();

    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  /* ================= RESET FORM ================= */

  const resetForm = () => {

    setFormData({
      name: "",
      price: 0,
      description: "",
      category: "kanha-ji-dresses",
    });

    setGeneratedImage(null);
  };

  /* ================= ADMIN AUTH ================= */

  const isAdmin = localStorage.getItem("token");

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto py-16 text-center">

          <h2 className="text-xl font-semibold mb-4">
            Access Denied
          </h2>

          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-primary text-white rounded-full"
          >
            Login as Admin
          </button>

        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">

      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">

        <h1 className="text-2xl font-bold mb-6">
          Admin Panel
        </h1>

        {/* CONTROLS */}

        <div className="flex gap-3 mb-6">

          <input
            type="text"
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All</option>
            <option value="kanha-ji-dresses">Kanha Dresses</option>
            <option value="sarees">Sarees</option>
            <option value="other-products">Other Products</option>
          </select>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded"
          >
            <Plus size={16} />
            Add Product
          </button>

        </div>

        {/* PRODUCT LIST */}

        <div className="bg-white border rounded-lg overflow-hidden">

          {filteredProducts.map((product) => (

            <div
              key={product._id}
              className="flex items-center gap-4 p-4 border-b"
            >

              <img
                src={`${IMAGE_BASE}/${product.image}`}
                className="w-16 h-16 object-cover rounded"
              />

              <div className="flex-1">

                <h3 className="font-medium">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {formatPrice(product.price)}
                </p>

                <p className="text-xs text-gray-400">
                  {categoryLabels[product.category]}
                </p>

                <p className="text-xs">
                  {"★".repeat(Math.round(product.rating || 4))}
                  ({product.reviews})
                </p>

              </div>

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === product._id ? null : product._id
                    )
                  }
                >
                  {expandedId === product._id ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* ADD PRODUCT FORM */}

        {showAddForm && (

          <div className="mt-8 border rounded-lg p-6 bg-white">

            <h2 className="text-lg font-semibold mb-4">
              Add Product
            </h2>

            <div className="space-y-4">

              {/* NAME */}

              <input
                type="text"
                placeholder="Product name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* PRICE */}

              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Number(e.target.value),
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* DESCRIPTION */}

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* CATEGORY SELECT */}

              <div>

                <label className="text-sm font-medium">
                  Category
                </label>

                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as
                        | "kanha-ji-dresses"
                        | "sarees"
                        | "other-products",
                    })
                  }
                  className="w-full border px-3 py-2 rounded mt-1"
                >
                  <option value="kanha-ji-dresses">
                    Kanha Ji Dresses
                  </option>

                  <option value="sarees">
                    Sarees
                  </option>

                  <option value="other-products">
                    Other Products
                  </option>

                </select>

              </div>

              {/* AI IMAGE */}

              <AIImageGenerator
                category={formData.category}
                description={formData.description}
                onImageGenerated={(img) =>
                  setGeneratedImage(img)
                }
              />

              {/* ADD BUTTON */}

              <button
                onClick={handleAddProduct}
                className="bg-primary text-white px-6 py-2 rounded"
              >
                Add Product
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}