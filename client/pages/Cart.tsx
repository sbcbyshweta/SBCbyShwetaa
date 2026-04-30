import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotal, getItemCount } =
    useCart();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsApplying(true);
    setCouponError("");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const coupons: Record<string, number> = {
      WELCOME10: 10,
      SAVE20: 20,
      SBC50: 50,
      FLAT100: 100,
      FESTIVE: 15,
    };

    const code = couponCode.trim().toUpperCase();

    if (coupons[code]) {
      setDiscount(coupons[code]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      setCouponError("Invalid coupon code. Try WELCOME10 for 10% off!");
      setDiscount(0);
    }

    setIsApplying(false);
  };

  const subtotal = getTotal();
  const discountAmount = Math.round((subtotal * discount) / 100);
  const total = subtotal - discountAmount;
  const shipping = subtotal > 500 ? 0 : 100;
  const finalTotal = total + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcf6ed]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-32 h-32 bg-gradient-to-br from-[#c9a87c]/20 to-[#e8c4a0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={64} className="text-[#c9a87c]" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any beautiful items to your cart
                yet. Start exploring our divine collections!
              </p>
              <Link
                to="/category/kanha-ji-dresses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
              >
                <ArrowLeft size={20} />
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf6ed]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <Link
            to="/category/kanha-ji-dresses"
            className="inline-flex items-center gap-2 text-[#c9a87c] hover:text-[#b8956d] transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">
            {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={String(item.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-4">
                  <Link
                    to={`/product/${item.id}`}
                    className="flex-shrink-0 w-full sm:w-32 h-40 sm:h-32"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl hover:opacity-90 transition"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop";
                      }}
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/product/${item.id}`}
                        className="font-serif text-xl font-semibold text-gray-900 hover:text-[#c9a87c] transition-colors block mb-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 mb-4">
                        {item.category
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{item.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="self-start sm:self-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove from cart"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a coupon?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c] focus:border-transparent text-sm uppercase tracking-wider"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={isApplying}
                    className="px-5 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isApplying ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-sm mt-2">{couponError}</p>
                )}
                {showSuccess && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                    <Check size={14} /> Coupon applied successfully!
                  </p>
                )}
              </div>

              <div className="space-y-4 pb-6 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span
                    className={
                      subtotal > 500 ? "text-green-600 font-medium" : ""
                    }
                  >
                    {subtotal > 500 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                {subtotal <= 500 && (
                  <p className="text-xs text-[#c9a87c]">
                    Add ₹{500 - subtotal} more for FREE shipping!
                  </p>
                )}
              </div>

              <div className="py-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tax included where applicable
                </p>
              </div>

              <Link
                to="/checkout"
                className="block w-full py-4 bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all text-center"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck size={20} className="text-green-600" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={20} className="text-[#c9a87c]" />
                  <span>Free delivery on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RotateCcw size={20} className="text-blue-600" />
                  <span>Easy 14-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
