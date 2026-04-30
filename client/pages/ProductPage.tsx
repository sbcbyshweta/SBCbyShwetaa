import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { API_URL, getFullImageUrl } from "@/lib/api";
import {
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
} from "lucide-react";

function getImageUrl(image: string) {
  return getFullImageUrl(image);
}

export default function ProductPage() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setQuantity(1);
    setSelectedImage(0);
    setAddedToCart(false);

    fetch(`${API_URL}/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) {
          setProduct(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setIsLoading(false);
      });

    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        const allProducts = Array.isArray(data) ? data : data.products || [];
        const related = allProducts
          .filter(
            (p: any) => p._id !== productId && p.category === product?.category,
          )
          .slice(0, 4);
        setRelatedProducts(related);
      })
      .catch((err) => console.error("Error fetching related products:", err));
  }, [productId, product?.category]);

  const handleAddToCart = () => {
    const prodId = product._id || product.id || productId;
    addToCart({
      id: String(prodId),
      name: product.name,
      price: product.price,
      image: getImageUrl(product.image),
      category: product.category,
      quantity: quantity,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "kanha-ji-dresses":
        return "Kanha Ji Dresses";
      case "sarees":
        return "Sarees";
      case "other-products":
        return "Special Collections";
      default:
        return category;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcf6ed]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-1/4" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fcf6ed]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/category/kanha-ji-dresses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-medium hover:shadow-lg transition"
          >
            <ChevronLeft size={20} />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const productIdFinal = product._id || product.id || productId;
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#fcf6ed]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-[#c9a87c] transition">
            Home
          </Link>
          <span>/</span>
          <Link
            to={`/category/${product.category}`}
            className="hover:text-[#c9a87c] transition"
          >
            {getCategoryName(product.category)}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-md aspect-square">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop";
                }}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  {discount}% OFF
                </div>
              )}
              <button className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition">
                <Heart
                  size={24}
                  className="text-gray-600 hover:text-red-500 transition"
                />
              </button>
            </div>

            {/* Color Swatches / Thumbnails */}
            {product.colors && product.colors.length > 1 && (
              <div className="flex gap-2">
                {product.colors.map((color: string, index: number) => (
                  <button
                    key={color}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      selectedImage === index
                        ? "bg-[#c9a87c] text-white border-[#c9a87c]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#c9a87c]"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm text-[#c9a87c] font-medium uppercase tracking-wider">
                {getCategoryName(product.category)}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mt-2 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.round(product.rating || 4)
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating || 4.5} ({product.reviews || 0} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-green-600 font-medium">
                        Save ₹
                        {(
                          product.originalPrice - product.price
                        ).toLocaleString()}
                      </span>
                    </>
                  )}
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-700 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <span className="w-16 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-500 text-sm">
                  Total: ₹{(product.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Add to Cart Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                  addedToCart
                    ? "bg-green-600 text-white"
                    : product.stock > 0
                      ? "bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white hover:shadow-xl hover:scale-[1.02]"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={24} />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={24} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck size={24} className="text-green-600" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Truck size={24} className="text-[#c9a87c]" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw size={24} className="text-blue-600" />
                <span>Easy Returns</span>
              </div>
            </div>

            {/* Product Details */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <span
                      key={color}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-sm"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <span
                      key={size}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-sm"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-200">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const relId = p._id || p.id;
                return (
                  <Link
                    key={relId}
                    to={`/product/${relId}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-semibold text-gray-900 mb-2 line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{p.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
