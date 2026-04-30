import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Package,
  DollarSign,
  Eye,
  Star,
  Search,
  CheckCircle,
  AlertCircle,
  Upload,
  Check,
  Loader,
  BarChart3,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  Image as ImageIcon,
  Grid3X3,
  List,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { API_URL, BACKEND_URL } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: "kanha-ji-dresses" | "sarees" | "other-products";
  image: string;
  rating: number;
  stock: number;
  colors?: string[];
  sizes?: string[];
  originalPrice?: number;
  reviews?: number;
  createdAt?: string;
}

interface Order {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  products: Array<{
    productId: { _id: string; name: string; price: number; image: string };
    quantity: number;
    name: string;
    price: number;
    image: string;
  }>;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentId: string;
  createdAt: string;
}

interface Stats {
  totalProducts: number;
  totalValue: number;
  avgPrice: number;
  lowStock: number;
}

const categoryLabels: Record<string, string> = {
  "kanha-ji-dresses": "Kanha Ji Dresses",
  sarees: "Sarees",
  "other-products": "Special Collections",
};

const categoryColors: Record<string, string> = {
  "kanha-ji-dresses": "bg-blue-100 text-blue-700",
  sarees: "bg-purple-100 text-purple-700",
  "other-products": "bg-green-100 text-green-700",
};

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString("en-IN")}`;
};

const ITEMS_PER_PAGE = 15;

export default function AdminPanel() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "products" | "dashboard" | "orders"
  >("dashboard");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderTab, setOrderTab] = useState("new");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "kanha-ji-dresses" as Product["category"],
    stock: "10",
    rating: "5",
    colors: "",
    sizes: "",
    imageUrl: "",
  });

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching products from API...");

      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      console.log("API Response:", data);

      let fetchedProducts: Product[] = [];
      if (Array.isArray(data)) {
        fetchedProducts = data;
      } else if (data.products) {
        fetchedProducts = data.products;
      }

      const normalized = fetchedProducts.map((p: any) => ({
        ...p,
        id: p._id,
        reviews: p.reviews ?? Math.floor(Math.random() * 150),
        colors: p.colors ?? ["Default"],
        sizes: p.sizes ?? ["Free Size"],
        originalPrice: p.originalPrice ?? p.price,
      }));

      console.log("Normalized products:", normalized.length);
      setProducts(normalized);
    } catch (error) {
      console.error("Fetch products error:", error);
      showNotification(
        "Failed to fetch products - Is server running?",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders((prev) => {
          const prevStr = JSON.stringify(prev.map((o) => o.status));
          const nextStr = JSON.stringify(data.map((o: Order) => o.status));
          if (prevStr !== nextStr) {
            console.log("Orders updated, refreshing...");
          }
          return data;
        });
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showNotification("Order status updated!", "success");
        fetchOrders();
      } else {
        showNotification("Failed to update status", "error");
      }
    } catch (error) {
      showNotification("Error updating order", "error");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showNotification("Order deleted!", "success");
        fetchOrders();
      } else {
        showNotification("Failed to delete", "error");
      }
    } catch (error) {
      showNotification("Error deleting order", "error");
    }
  };

  const stats: Stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + p.price * (p.stock || 10), 0),
    avgPrice:
      products.length > 0
        ? Math.round(
            products.reduce((sum, p) => sum + p.price, 0) / products.length,
          )
        : 0,
    lowStock: products.filter((p) => p.stock < 5).length,
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    const matchesStock =
      filterStock === "all" ||
      (filterStock === "in-stock" && product.stock > 0) ||
      (filterStock === "low-stock" && product.stock > 0 && product.stock < 5) ||
      (filterStock === "out-of-stock" && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      description: "",
      category: "kanha-ji-dresses",
      stock: "10",
      rating: "5",
      colors: "",
      sizes: "",
      imageUrl: "",
    });
    setUploadedImage(null);
    setUploadPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      originalPrice: String(product.originalPrice || product.price),
      description: product.description,
      category: product.category,
      stock: String(product.stock),
      rating: String(product.rating),
      colors: product.colors?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
      imageUrl: product.image || "",
    });

    if (product.image) {
      if (product.image.startsWith("http")) {
        setUploadPreview(product.image);
      } else {
        setUploadPreview(getImageUrl(product.image));
      }
    }
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      showNotification("Please fill Name and Price", "error");
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("price", formData.price);
      formDataObj.append(
        "originalPrice",
        formData.originalPrice || formData.price,
      );
      formDataObj.append("description", formData.description);
      formDataObj.append("category", formData.category);
      formDataObj.append("stock", formData.stock || "10");
      formDataObj.append("rating", formData.rating || "5");
      formDataObj.append(
        "colors",
        JSON.stringify(
          formData.colors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean) || ["Default"],
        ),
      );
      formDataObj.append(
        "sizes",
        JSON.stringify(
          formData.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean) || ["Free Size"],
        ),
      );

      if (uploadedImage) {
        formDataObj.append("image", uploadedImage);
        console.log("Uploading file:", uploadedImage.name);
      } else if (formData.imageUrl) {
        formDataObj.append("imageUrl", formData.imageUrl);
        console.log("Using URL:", formData.imageUrl);
      }

      const url = editingProduct
        ? `${API_URL}/products/${editingProduct._id}`
        : `${API_URL}/products`;

      console.log("Submitting to:", url);

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        body: formDataObj,
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        showNotification(
          editingProduct ? "Product updated!" : "Product added!",
          "success",
        );
        fetchProducts();
        setShowAddForm(false);
        setEditingProduct(null);
        resetForm();
      } else {
        showNotification(data.message || "Operation failed", "error");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      showNotification("Error: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showNotification("Product deleted!", "success");
        fetchProducts();
      } else {
        showNotification("Failed to delete", "error");
      }
    } catch (error) {
      showNotification("Error deleting product", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm(`Delete ${selectedProducts.length} products?`)) return;

    try {
      setIsLoading(true);
      await Promise.all(
        selectedProducts.map((id) =>
          fetch(`${API_URL}/products/${id}`, { method: "DELETE" }),
        ),
      );
      showNotification(
        `${selectedProducts.length} products deleted!`,
        "success",
      );
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (error) {
      showNotification("Error deleting products", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map((p) => p._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const getImageUrl = (image: string) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads")) return `${BACKEND_URL}${image}`;
    return `${BACKEND_URL}/uploads/${image}`;
  };

  const isAdmin = localStorage.getItem("token");

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
            <AlertCircle size={64} className="text-amber-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need admin privileges.</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-semibold"
            >
              Login as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification && (
          <div
            className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={24} className="text-green-600" />
            ) : (
              <AlertCircle size={24} className="text-red-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {isLoading ? "Loading..." : `${products.length} products`}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                activeTab === "dashboard"
                  ? "bg-[#c9a87c] text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <BarChart3 size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                activeTab === "products"
                  ? "bg-[#c9a87c] text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Package size={18} />
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                activeTab === "orders"
                  ? "bg-[#c9a87c] text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <ClipboardList size={18} />
              Orders
              {orders.length > 0 && (
                <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">
                  {orders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingProduct(null);
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalProducts}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="text-blue-600" size={28} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Inventory Value
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPrice(stats.totalValue)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-green-600" size={28} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Price</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPrice(stats.avgPrice)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={28} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {stats.lowStock}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="text-amber-600" size={28} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <>
            {/* Order Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[
                {
                  key: "new",
                  label: "New Orders",
                  statuses: ["pending"],
                  bg: "bg-amber-600",
                  badge: "bg-amber-100 text-amber-700",
                },
                {
                  key: "progress",
                  label: "In Progress",
                  statuses: ["confirmed", "shipped", "out_for_delivery"],
                  bg: "bg-blue-600",
                  badge: "bg-blue-100 text-blue-700",
                },
                {
                  key: "delivered",
                  label: "Delivered",
                  statuses: ["delivered"],
                  bg: "bg-green-600",
                  badge: "bg-green-100 text-green-700",
                },
                {
                  key: "cancelled",
                  label: "Cancelled",
                  statuses: ["cancelled"],
                  bg: "bg-red-600",
                  badge: "bg-red-100 text-red-700",
                },
              ].map((tab) => {
                const count = orders.filter((o) =>
                  tab.statuses.includes(o.status),
                ).length;
                const isActive = orderTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setOrderTab(tab.key)}
                    className={`px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition flex items-center gap-2 ${
                      isActive
                        ? `${tab.bg} text-white shadow-md`
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? "bg-white/30" : tab.badge
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">
                Auto-refreshing every 5 seconds
              </span>
            </div>

            {(() => {
              const tabConfig: Record<
                string,
                { label: string; statuses: string[] }
              > = {
                new: {
                  label: "New Orders",
                  statuses: ["pending"],
                },
                progress: {
                  label: "In Progress",
                  statuses: ["confirmed", "shipped", "out_for_delivery"],
                },
                delivered: {
                  label: "Delivered",
                  statuses: ["delivered"],
                },
                cancelled: {
                  label: "Cancelled",
                  statuses: ["cancelled"],
                },
              };

              const config = tabConfig[orderTab];
              const filteredOrders = orders.filter((o) =>
                config.statuses.includes(o.status),
              );

              if (filteredOrders.length === 0) {
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <ClipboardList
                      size={48}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <p className="text-gray-500 font-medium">
                      No {config.label.toLowerCase()}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const statusColors: Record<string, string> = {
                      pending: "bg-amber-100 text-amber-700",
                      confirmed: "bg-blue-100 text-blue-700",
                      shipped: "bg-purple-100 text-purple-700",
                      out_for_delivery: "bg-orange-100 text-orange-700",
                      delivered: "bg-green-100 text-green-700",
                      cancelled: "bg-red-100 text-red-700",
                    };
                    return (
                      <div
                        key={order._id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                      >
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-sm font-mono text-gray-500">
                                  #{order._id.slice(-8).toUpperCase()}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}
                                >
                                  {order.status
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="font-medium text-gray-900">
                                  {order.customerName}
                                </span>
                                <span>•</span>
                                <span>{order.phone}</span>
                                <span>•</span>
                                <span>
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {order.address}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#c9a87c]">
                                {formatPrice(order.totalAmount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.paymentMethod === "cod"
                                  ? "Cash on Delivery"
                                  : "Online Payment"}
                              </p>
                            </div>
                          </div>

                          {/* Products */}
                          <div className="border-t pt-4">
                            <button
                              onClick={() =>
                                setExpandedOrder(
                                  expandedOrder === order._id
                                    ? null
                                    : order._id,
                                )
                              }
                              className="flex items-center gap-2 text-sm text-[#c9a87c] hover:underline"
                            >
                              <ChevronDown
                                size={16}
                                className={`transition-transform ${expandedOrder === order._id ? "rotate-180" : ""}`}
                              />
                              {order.products.length} item(s)
                            </button>

                            {expandedOrder === order._id && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {order.products.map((p, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                  >
                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                      <img
                                        src={
                                          p.image ||
                                          p.productId?.image ||
                                          "https://via.placeholder.com/56?text=?"
                                        }
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {p.name ||
                                          p.productId?.name ||
                                          "Product"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Qty: {p.quantity}
                                      </p>
                                      <p className="text-sm font-semibold text-[#c9a87c]">
                                        ₹
                                        {(
                                          (p.price || p.productId?.price || 0) *
                                          p.quantity
                                        ).toLocaleString("en-IN")}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Status Actions */}
                          <div className="border-t mt-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">
                                Update status:
                              </span>
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    e.target.value,
                                  )
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border-0 cursor-pointer ${statusColors[order.status]}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">
                                  Out for Delivery
                                </option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>
        )}

        {activeTab === "products" && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c] bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="kanha-ji-dresses">Kanha Ji Dresses</option>
                  <option value="sarees">Sarees</option>
                  <option value="other-products">Special Collections</option>
                </select>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-3 ${viewMode === "table" ? "bg-[#c9a87c] text-white" : "bg-white"}`}
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 ${viewMode === "grid" ? "bg-[#c9a87c] text-white" : "bg-white"}`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                <span className="text-red-800 font-medium">
                  {selectedProducts.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Selected
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader
                    className="animate-spin mx-auto text-[#c9a87c]"
                    size={40}
                  />
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag
                    size={48}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <p className="text-gray-500 font-medium">No products found</p>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddForm(true);
                    }}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl"
                  >
                    Add First Product
                  </button>
                </div>
              ) : viewMode === "table" ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleSelectProduct(product._id)}
                            className="w-5 h-5 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-[#c9a87c]"
                              onClick={() =>
                                setShowImagePreview(getImageUrl(product.image))
                              }
                            >
                              <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/100x100?text=No+Image";
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {product._id.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[product.category] || "bg-gray-100"}`}
                          >
                            {categoryLabels[product.category] ||
                              product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold">
                            {formatPrice(product.price)}
                          </p>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </p>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              product.stock > 5
                                ? "bg-green-100 text-green-700"
                                : product.stock > 0
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} in stock`
                              : "Out of stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/product/${product._id}`)
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
                    >
                      <div
                        className="aspect-square bg-gray-100 cursor-pointer"
                        onClick={() =>
                          setShowImagePreview(getImageUrl(product.image))
                        }
                      >
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/300x300?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-lg font-bold text-[#c9a87c]">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 py-2 text-sm border rounded-lg hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex-1 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredProducts.length,
                    )}{" "}
                    of {filteredProducts.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-medium ${currentPage === i + 1 ? "bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white" : "bg-gray-100"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Image
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#c9a87c] transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadPreview ? (
                    <div className="relative">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                          setUploadPreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <p className="text-gray-600 font-medium">
                        Click to upload image
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or Paste Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Original Price
                  </label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as Product["category"],
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c] bg-white"
                >
                  <option value="kanha-ji-dresses">Kanha Ji Dresses</option>
                  <option value="sarees">Sarees</option>
                  <option value="other-products">Special Collections</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Colors
                  </label>
                  <input
                    type="text"
                    placeholder="Red, Blue, Gold"
                    value={formData.colors}
                    onChange={(e) =>
                      setFormData({ ...formData, colors: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sizes
                  </label>
                  <input
                    type="text"
                    placeholder="S, M, L, XL"
                    value={formData.sizes}
                    onChange={(e) =>
                      setFormData({ ...formData, sizes: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader className="animate-spin" size={20} />
                ) : null}
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImagePreview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowImagePreview(null)}
        >
          <img
            src={showImagePreview}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
