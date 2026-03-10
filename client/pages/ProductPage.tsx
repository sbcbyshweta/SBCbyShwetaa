import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductPage() {

  const { productId } = useParams();
  const { addToCart } = useCart();

  const product = products.find((p) => String(p.id) === String(productId));

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div>
        <Header />
        <div className="text-center py-20">
          <p className="text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  return (
    <div className="min-h-screen bg-[#fcf6ed]">

      <Header />

      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* Breadcrumb */}

        <div className="text-sm text-muted-foreground mb-8 flex gap-2">

          <Link to="/">Home</Link>
          <span>›</span>

          <Link to={`/category/${product.category}`}>
            {product.category.replace("-", " ")}
          </Link>

          <span>›</span>
          <span>{product.name}</span>

        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* Image */}

          <div className="bg-white rounded-2xl overflow-hidden shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>

          {/* Product Info */}

          <div>

            <h1 className="text-4xl font-serif font-bold mb-4">
              {product.name}
            </h1>

            <div className="text-3xl text-primary font-bold mb-6">
              ₹{product.price.toLocaleString()}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity */}

            <div className="flex items-center gap-4 mb-6">

              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded"
              >
                -
              </button>

              <span>{quantity}</span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border rounded"
              >
                +
              </button>

            </div>

            {/* Buttons */}

            <div className="flex gap-3 mb-10">

              <button
                onClick={() =>
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    quantity: quantity,
                  })
                }
                className="flex-1 py-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              <button className="w-12 h-12 border rounded-lg flex items-center justify-center">
                <Heart size={20} />
              </button>

            </div>

            {/* Features */}

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✔ Premium Quality Fabric</p>
              <p>✔ Handcrafted Design</p>
              <p>✔ 14 Day Easy Returns</p>
              <p>✔ Secure Checkout</p>
            </div>

          </div>

        </div>

        {/* Related Products */}

        {relatedProducts.length > 0 && (

          <div className="mt-20">

            <h2 className="text-3xl font-serif font-bold mb-8">
              Related Products
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {relatedProducts.slice(0, 4).map((p) => (

                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >

                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-4">

                    <h3 className="font-semibold mb-2">
                      {p.name}
                    </h3>

                    <p className="text-primary font-bold">
                      ₹{p.price.toLocaleString()}
                    </p>

                  </div>

                </Link>

              ))}

            </div>

          </div>

        )}

      </div>
    </div>
  );
}