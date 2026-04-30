import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { API_URL, getFullImageUrl } from "@/lib/api";
import {
  Search,
  Filter,
  X,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  LayoutList,
} from "lucide-react";

const ITEMS_PER_PAGE = 12;

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  stock: number;
  colors?: string[];
  sizes?: string[];
  reviews?: number;
}

export default function CategoryPage() {
  const { category = "kanha-ji-dresses" } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getImageUrl = (image: string) => {
    return getFullImageUrl(image);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/products?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.products) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setIsLoading(false);
      });
  }, [category]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
  }, [category]);

  const getCategoryTitle = () => {
    switch (category) {
      case "kanha-ji-dresses":
        return "Divine Kanha Ji Dresses";
      case "sarees":
        return "Exquisite Saree Collection";
      case "other-products":
        return "SBC Exclusive Collections";
      default:
        return "Products";
    }
  };

  const getCategoryDescription = () => {
    switch (category) {
      case "kanha-ji-dresses":
        return "Adorn your beloved Kanha Ji with attire that reflects grace, devotion, and timeless tradition. Every dress is thoughtfully handcrafted to celebrate the divine beauty of Lord Krishna.";
      case "sarees":
        return "Experience the charm of timeless Indian elegance with our exquisite saree collection.";
      case "other-products":
        return "Discover our seasonal special products crafted for festivals and special moments.";
      default:
        return "Explore our curated collection crafted with elegance and devotion.";
    }
  };

  const getCategoryBanner = () => {
    switch (category) {
      case "kanha-ji-dresses":
        return "from-[#4a6741] to-[#2d4028]";
      case "sarees":
        return "from-[#8b4a6b] to-[#5c2d45]";
      case "other-products":
        return "from-[#8b6b4a] to-[#5c452d]";
      default:
        return "from-[#6b5a4a] to-[#453d35]";
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    filtered = filtered.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice,
    );

    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors?.some((c: string) => selectedColors.includes(c)),
      );
    }

    if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);

    return filtered;
  }, [products, searchQuery, minPrice, maxPrice, selectedColors, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const allColors = Array.from(
    new Set(products.flatMap((p) => p.colors || [])),
  );

  const handleAddToCart = (product: Product) => {
    const productId = product._id || product.id || String(Math.random());
    addToCart({
      id: productId,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.image),
      category: product.category,
      quantity: 1,
    });

    navigate("/cart");
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const productId = product._id || product.id;
    const discount = product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

    return (
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#c9a87c]">
        <div
          className="relative cursor-pointer"
          onClick={() => navigate(`/product/${productId}`)}
        >
          <div className="aspect-[4/5] overflow-hidden bg-gray-100">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop";
              }}
            />
          </div>
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {discount}% OFF
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
        </div>

        <div className="p-4">
          <h3
            onClick={() => navigate(`/product/${productId}`)}
            className="font-serif text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-[#c9a87c] transition"
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < Math.round(product.rating || 4) ? "text-amber-500" : "text-gray-300"}`}
              >
                ★
              </span>
            ))}
            <span className="text-gray-400 text-xs ml-1">
              ({product.reviews || 0})
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            className="w-full py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcf6ed]">
      <Header />

      {/* Category Banner */}
      <div className={`bg-gradient-to-r ${getCategoryBanner()} py-16 md:py-20`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {getCategoryTitle()}
          </h1>
          <div className="w-24 h-1 bg-white/50 mx-auto mb-6 rounded-full" />
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            {getCategoryDescription()}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search in this category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9a87c] focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm md:hidden"
            >
              <Filter size={18} />
              Filters
            </button>

            <div className="hidden md:flex border border-gray-200 rounded-xl bg-white shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? "bg-[#c9a87c] text-white" : "text-gray-600"} rounded-l-xl transition`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${viewMode === "list" ? "bg-[#c9a87c] text-white" : "text-gray-600"} rounded-r-xl transition`}
              >
                <LayoutList size={18} />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9a87c] focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${showFilters ? "block" : "hidden"} md:block bg-white rounded-2xl border border-gray-100 p-6 h-fit sticky top-24`}
          >
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-100">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#c9a87c]/10 rounded-lg flex items-center justify-center text-[#c9a87c] text-sm">
                  {filteredProducts.length}
                </span>
                Products Found
              </h4>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-500">
                Price Range
              </h4>
              <input
                type="range"
                min="0"
                max="100000"
                step="100"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#c9a87c]"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>₹{minPrice.toLocaleString()}</span>
                <span>₹{maxPrice.toLocaleString()}</span>
              </div>
            </div>

            {allColors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-500">
                  Colors
                </h4>
                <div className="space-y-2">
                  {allColors.map((color) => (
                    <label
                      key={color}
                      className="flex gap-3 items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedColors([...selectedColors, color]);
                          else
                            setSelectedColors(
                              selectedColors.filter((c) => c !== color),
                            );
                          setCurrentPage(1);
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-[#c9a87c] focus:ring-[#c9a87c]"
                      />
                      <span className="text-sm group-hover:text-[#c9a87c] transition">
                        {color}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedColors([]);
                setMinPrice(0);
                setMaxPrice(100000);
                setSortBy("newest");
                setSearchQuery("");
              }}
              className="w-full py-2 text-sm text-[#c9a87c] font-medium hover:bg-[#c9a87c]/5 rounded-lg transition"
            >
              Clear All Filters
            </button>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/5] bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {paginatedProducts.map((product) =>
                    viewMode === "grid" ? (
                      <ProductCard
                        key={product._id || product.id}
                        product={product}
                      />
                    ) : (
                      <div
                        key={product._id || product.id}
                        className="flex bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                      >
                        <div
                          className="w-48 h-48 cursor-pointer flex-shrink-0"
                          onClick={() =>
                            navigate(`/product/${product._id || product.id}`)
                          }
                        >
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop";
                            }}
                          />
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-2 mb-4">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${i < Math.round(product.rating || 4) ? "text-amber-500" : "text-gray-300"}`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="text-gray-400 text-xs">
                                ({product.reviews || 0} reviews)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-gray-900">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <span className="text-sm text-gray-400 line-through ml-2">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                            </div>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-medium hover:shadow-lg transition"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-3 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl font-medium transition ${
                          currentPage === i + 1
                            ? "bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white shadow-lg"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-3 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <ShoppingCart
                  size={64}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={() => {
                    setSelectedColors([]);
                    setMinPrice(0);
                    setMaxPrice(100000);
                    setSortBy("newest");
                    setSearchQuery("");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-medium hover:shadow-lg transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
