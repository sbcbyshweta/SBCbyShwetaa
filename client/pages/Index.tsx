import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import girlImage from "@/assets/girl.jpg";
import premium from "@/assets/premium.jpg";
import handcrafted from "@/assets/handcrafted.jpg";
import delivery from "@/assets/delivery.jpg";
import { API_URL, getFullImageUrl } from "@/lib/api";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

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
  stock?: number;
  colors?: string[];
  sizes?: string[];
  reviews?: number;
}

function ProductCard({
  product,
  variant = "peach",
}: {
  product: Product;
  variant?: "peach" | "dark";
}) {
  const { addToCart } = useCart();

  const productId = product._id || product.id || "";
  const productImage = getFullImageUrl(product.image);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: String(productId),
      name: product.name,
      price: product.price,
      image: productImage,
      category: product.category,
      quantity: 1,
    });
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const isPeach = variant === "peach";
  const cardBg = isPeach
    ? "bg-gradient-to-br from-[#e5a186] via-[#d49277] to-[#c4856a]"
    : "bg-gradient-to-br from-[#1a1612] via-[#2d2420] to-[#1a1612]";

  const borderColor = isPeach ? "border-[#c4856a]" : "border-[#4a3d32]";
  const textColor = isPeach ? "text-[#5a3a2a]" : "text-[#f5ebe0]";
  const textHover = isPeach ? "hover:text-[#3a2a1a]" : "hover:text-[#ffd5d5]";
  const priceColor = isPeach ? "text-[#8b5a3a]" : "text-[#ffd5d5]";
  const starColor = isPeach ? "text-[#c4856a]" : "text-[#e8c4a0]";
  const btnBorder = isPeach ? "border-[#c4856a]" : "border-[#5a4a3a]";
  const btnText = isPeach ? "text-[#5a3a2a]" : "text-[#e8d4c8]";
  const btnHover = isPeach
    ? "hover:bg-[#b8765a] hover:text-white"
    : "hover:bg-[#3d3228]";
  const addBtnBg = isPeach
    ? "bg-white text-[#c4856a]"
    : "bg-gradient-to-r from-[#c9a87c] via-[#d4b896] to-[#c9a87c]";
  const badgeBg = isPeach
    ? "bg-white text-[#c4856a]"
    : "bg-gradient-to-r from-[#e8b4b8] to-[#d4a5a8] text-[#1a1612]";

  return (
    <div
      className={`group snap-start min-w-[300px] max-w-[300px] relative rounded-2xl overflow-hidden ${cardBg} shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border ${borderColor}`}
    >
      <div className="relative p-4">
        <Link to={`/product/${productId}`}>
          <div className="relative h-64 rounded-xl overflow-hidden bg-white shadow-inner">
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.fallbackTriggered) {
                  target.dataset.fallbackTriggered = "true";
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23e5a186' width='300' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
          </div>
        </Link>

        {discount > 0 && (
          <div
            className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${badgeBg}`}
          >
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="px-5 pb-5 text-center">
        <Link to={`/product/${productId}`}>
          <h3
            className={`font-serif text-lg font-semibold mb-2 ${textColor} ${textHover} transition line-clamp-2`}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex justify-center items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${i < Math.round(product.rating || 4) ? starColor : "text-gray-400"}`}
            >
              ★
            </span>
          ))}
          <span className="text-gray-500 text-xs ml-1">
            ({product.reviews || 0})
          </span>
        </div>

        <div className="flex justify-center items-center gap-3 mb-4">
          <span className={`font-bold text-xl tracking-wide ${priceColor}`}>
            ₹{product.price.toLocaleString()}
          </span>

          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-500 line-through text-sm">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/product/${productId}`}
            className={`flex-1 py-2.5 border ${btnBorder} ${btnText} rounded-xl text-sm font-medium ${btnHover} transition-all duration-300`}
          >
            View Details
          </Link>

          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 ${addBtnBg}`}
          >
            <ShoppingCart size={14} className="inline mr-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ image, title, description }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center shadow-md border border-[#eadac5] hover:shadow-xl transition">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#eadac5] shadow-md">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      </div>

      <h3 className="font-serif text-xl font-semibold mb-2">{title}</h3>

      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dressSlider = useRef<HTMLDivElement>(null);
  const sareeSlider = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.products) {
          setProducts(data.products);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setIsLoading(false);
      });
  }, []);

  const dressProducts = products.filter(
    (p) => p.category === "kanha-ji-dresses",
  );

  const sareeProducts = products.filter((p) => p.category === "sarees");

  const specialProducts = products.filter(
    (p) => p.category === "other-products",
  );

  const scrollLeft = (sliderRef: any) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -350,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = (sliderRef: any) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 350,
        behavior: "smooth",
      });
    }
  };

  const ProductSlider = ({
    products,
    ref,
  }: {
    products: Product[];
    ref: React.RefObject<HTMLDivElement | null>;
  }) => {
    const loopedProducts = [...products, ...products, ...products];

    return (
      <div className="relative">
        <button
          onClick={() => scrollLeft(ref)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition -ml-4"
        >
          <ArrowRight size={24} className="rotate-180" />
        </button>

        <div
          ref={ref}
          className="flex gap-8 overflow-x-auto scrollbar-hide px-4 py-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loopedProducts.map((product, i) => (
            <ProductCard
              key={`${product._id || product.id}-loop-${i}`}
              product={product}
              variant="peach"
            />
          ))}
        </div>

        <button
          onClick={() => scrollRight(ref)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition -mr-4"
        >
          <ArrowRight size={24} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcf6ed]">
      <Header />

      <section className="relative py-20 overflow-hidden bg-[radial-gradient(circle_at_top,#fff6ea,#fcf6ed,#f3e6d3)]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-primary font-semibold tracking-wider">
              ✦ Divine Collection ✦
            </span>

            <h1 className="text-5xl font-serif font-bold mt-4 mb-6 leading-tight text-[#2d2a26]">
              Divine Fashion for
              <br />
              Kanha Ji & You
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Explore exquisite handcrafted attire that radiates devotion,
              elegance and timeless beauty.
            </p>

            <div className="flex gap-4">
              <Link
                to="/category/kanha-ji-dresses"
                className="px-8 py-3 bg-primary text-white rounded-full shadow-md hover:scale-105 transition"
              >
                Shop Collection
              </Link>

              <Link
                to="/category/sarees"
                className="px-8 py-3 border-2 border-primary text-primary rounded-full hover:bg-primary/10 transition"
              >
                Explore Sarees
              </Link>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl h-[520px]">
            <img src={girlImage} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#fcf6ed]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold mb-8">
            About SBC by Shwetaa
          </h2>

          <p className="mb-16">
            We celebrate timeless tradition and modern elegance through
            thoughtfully crafted creations at SBC by Shwetaa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
            <FeatureCard
              image={premium}
              title="Premium Quality"
              description="Finest fabrics handpicked for luxury and durability"
            />

            <FeatureCard
              image={handcrafted}
              title="Handcrafted"
              description="Meticulously crafted with devotion and expertise"
            />

            <FeatureCard
              image={delivery}
              title="Trusted Delivery"
              description="Safe and secure delivery to your doorstep"
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-[#fdf8f5] via-[#f8f3ee] to-[#f5ebe6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-[#8b5e3c] font-medium tracking-widest uppercase text-sm">
                ✦ Sacred Attire ✦
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 mb-4 text-[#2d2420]">
                Divine Kanha Ji Dresses
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] rounded-full" />
            </div>
            <Link
              to="/category/kanha-ji-dresses"
              className="hidden md:flex items-center gap-2 text-[#c9a87c] font-medium hover:text-[#b8956d] transition"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="text-[#6a5a4a] mb-8 max-w-2xl">
            Handcrafted with devotion - Premium dresses for Lord Krishna
          </p>

          {isLoading ? (
            <div className="flex gap-8 overflow-x-auto px-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[300px] bg-white rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-64 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : dressProducts.length > 0 ? (
            <ProductSlider products={dressProducts} ref={dressSlider} />
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl">
              <p className="text-gray-500">
                No products in this category yet. Check back soon!
              </p>
            </div>
          )}

          <Link
            to="/category/kanha-ji-dresses"
            className="md:hidden flex items-center justify-center gap-2 mt-6 text-[#c9a87c] font-medium"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-[#fdf8f5] via-[#f8f3ee] to-[#f5ebe6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-[#8b5e3c] font-medium tracking-widest uppercase text-sm">
                ✦ Divine Collection ✦
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 mb-4 text-[#2d2420]">
                Exquisite Sarees Collection
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] rounded-full" />
            </div>
            <Link
              to="/category/sarees"
              className="hidden md:flex items-center gap-2 text-[#c9a87c] font-medium hover:text-[#b8956d] transition"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="text-[#6a5a4a] mb-8 max-w-2xl">
            Traditional and modern sarees crafted with premium silk and
            intricate designs
          </p>

          {isLoading ? (
            <div className="flex gap-8 overflow-x-auto px-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[300px] bg-white rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-64 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : sareeProducts.length > 0 ? (
            <ProductSlider products={sareeProducts} ref={sareeSlider} />
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl">
              <p className="text-gray-500">
                No products in this category yet. Check back soon!
              </p>
            </div>
          )}

          <Link
            to="/category/sarees"
            className="md:hidden flex items-center justify-center gap-2 mt-6 text-[#c9a87c] font-medium"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-[#fdf8f5] via-[#f8f3ee] to-[#f5ebe6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-[#8b5e3c] font-medium tracking-widest uppercase text-sm">
                ✦ Exclusive ✦
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 mb-4 text-[#2d2420]">
                Special Collections
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] rounded-full" />
            </div>
            <Link
              to="/category/other-products"
              className="hidden md:flex items-center gap-2 text-[#c9a87c] font-medium hover:text-[#b8956d] transition"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="text-[#6a5a4a] mb-8 max-w-2xl">
            Handpicked accessories and jewelry for your special occasions
          </p>

          {isLoading ? (
            <div className="flex gap-8 overflow-x-auto px-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[300px] bg-white rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-64 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : specialProducts.length > 0 ? (
            <ProductSlider products={specialProducts} ref={sareeSlider} />
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl">
              <p className="text-gray-500">
                No products in this category yet. Check back soon!
              </p>
            </div>
          )}

          <Link
            to="/category/other-products"
            className="md:hidden flex items-center justify-center gap-2 mt-6 text-[#c9a87c] font-medium"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
