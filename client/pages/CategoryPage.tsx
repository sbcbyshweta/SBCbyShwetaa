import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Search, Filter, X, ShoppingCart, Eye } from "lucide-react";

const ITEMS_PER_PAGE = 12;

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  colors?: string[];
  createdAt?: string;
}

export default function CategoryPage() {

  const { category = "kanha-ji-dresses" } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const API_URL = "https://sbc-backend-u2sm.onrender.com/api";

  /* ---------------- FETCH PRODUCTS ---------------- */

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Product fetch error:", err));
  }, []);

  /* ---------------- RESET PAGE ON FILTER CHANGE ---------------- */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, minPrice, maxPrice, selectedColors, sortBy]);

  /* ---------------- CATEGORY TITLE ---------------- */

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

  /* ---------------- CATEGORY PRODUCTS ---------------- */

  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === category);
  }, [products, category]);

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredProducts = useMemo(() => {

    let filtered = [...categoryProducts];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (p) => Number(p.price) >= minPrice && Number(p.price) <= maxPrice
    );

    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c))
      );
    }

    if (sortBy === "price-asc")
      filtered.sort((a, b) => Number(a.price) - Number(b.price));

    if (sortBy === "price-desc")
      filtered.sort((a, b) => Number(b.price) - Number(a.price));

    if (sortBy === "newest")
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );

    return filtered;

  }, [searchQuery, minPrice, maxPrice, selectedColors, sortBy, categoryProducts]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ---------------- COLORS ---------------- */

  const allColors = Array.from(
    new Set(categoryProducts.flatMap((p) => p.colors || []))
  );

  /* ---------------- ADD TO CART ---------------- */

  const handleAddToCart = (product: Product) => {

    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1,
    });

    alert(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-[#fcf6ed]">

      <Header />

      <div className="max-w-7xl mx-auto px-4 py-14">

        {/* Category Header */}

        <div className="text-center mb-14">

          <h1 className="text-5xl font-serif font-bold text-[#5a4632] mb-4">
            {getCategoryTitle()}
          </h1>

          <div className="w-24 h-[3px] bg-gradient-to-r from-[#d4af37] to-[#f3d9a5] mx-auto mb-5 rounded-full"></div>

          <p className="text-gray-600 text-lg">
            Discover handcrafted elegance made with devotion
          </p>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            {getCategoryDescription()}
          </p>

        </div>

        {/* Search */}

        <div className="mb-8 flex gap-3">

          <div className="flex-1 relative">

            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />

          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 border rounded-xl bg-white shadow-sm md:hidden"
          >
            <Filter size={18} />
            Filters
          </button>

        </div>

        <div className="grid md:grid-cols-4 gap-8">

          {/* Filters */}

          <div className={`${showFilters ? "block" : "hidden"} md:block bg-white rounded-2xl border p-6 shadow-sm h-fit sticky top-24`}>

            <div className="flex justify-between mb-4 md:hidden">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Price */}

            <div className="mb-6">

              <h4 className="font-semibold mb-3 text-sm">Price Range</h4>

              <input
                type="range"
                min="0"
                max="10000"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full"
              />

              <input
                type="range"
                min="0"
                max="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full"
              />

              <p className="text-sm text-gray-500 mt-2">
                ₹{minPrice} - ₹{maxPrice}
              </p>

            </div>

            {/* Colors */}

            {allColors.length > 0 && (
              <div className="mb-6">

                <h4 className="font-semibold mb-3 text-sm">Colors</h4>

                <div className="space-y-2">

                  {allColors.map((color) => (
                    <label key={color} className="flex gap-2 items-center">

                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedColors([...selectedColors, color]);
                          else
                            setSelectedColors(
                              selectedColors.filter((c) => c !== color)
                            );
                        }}
                      />

                      <span className="text-sm">{color}</span>

                    </label>
                  ))}

                </div>

              </div>
            )}

            <button
              onClick={() => {
                setSelectedColors([]);
                setMinPrice(0);
                setMaxPrice(10000);
              }}
              className="text-sm text-[#b8962e]"
            >
              Clear Filters
            </button>

          </div>

          {/* Products */}

          <div className="md:col-span-3">

            <div className="flex justify-end mb-6">

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >

                <option value="newest">Newest</option>
                <option value="price-asc">Price Low → High</option>
                <option value="price-desc">Price High → Low</option>

              </select>

            </div>

            {/* Grid */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">

              {paginatedProducts.map((product) => (

                <div
                  key={product._id || product.id}
                  className="group relative bg-gradient-to-b from-[#d4af78] to-[#967859] rounded-3xl p-5 shadow-xl border border-[#d4af37]/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >

                  <div
                    onClick={() =>
                      navigate(`/product/${product._id || product.id}`)
                    }
                    className="bg-[#ffffff10] backdrop-blur-md p-3 rounded-2xl mb-5 cursor-pointer border border-white/10"
                  >

                    <div className="h-56 overflow-hidden rounded-xl bg-white">

                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />

                    </div>

                  </div>

                  <div className="text-center">

                    <h3
                      onClick={() =>
                        navigate(`/product/${product._id || product.id}`)
                      }
                      className="text-2xl font-semibold text-[#f8f4ea] mb-2 cursor-pointer hover:text-[#ffe4c4]"
                    >
                      {product.name}
                    </h3>

                    <div className="flex justify-center items-center gap-2 mb-4">
                      <span className="text-[#ffe4c4] text-3xl font-bold">
                        ₹{product.price}
                      </span>
                    </div>

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          navigate(`/product/${product._id || product.id}`)
                        }
                        className="flex-1 py-2 border border-[#d4af37]/93 text-[#fff7db] rounded-xl flex items-center justify-center gap-2"
                      >
                        <Eye size={16} /> View
                      </button>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 py-2 border border-[#d4af37]/93 text-[#fff7db] rounded-xl flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={16} /> Add
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}