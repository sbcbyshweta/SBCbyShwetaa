import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

export default function Cart() {

  const { cart, removeFromCart, updateQuantity, getTotal } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  /* ------------------------------ */
  /* Coupon Logic                   */
  /* ------------------------------ */

  const applyCoupon = () => {

    const coupons: Record<string, number> = {
      WELCOME10: 10,
      SAVE20: 20,
      FLAT500: 500,
    };

    const code = couponCode.trim().toUpperCase();

    if (!code) {
      alert("Please enter a coupon code");
      return;
    }

    if (coupons[code]) {
      setDiscount(coupons[code]);
    } else {
      alert("Invalid coupon code");
      setDiscount(0);
    }

  };


  /* ------------------------------ */
  /* Price Calculations             */
  /* ------------------------------ */

  const subtotal = getTotal();

  const total = Math.max(0, subtotal - discount);

  const shipping = subtotal > 500 ? 0 : 100;

  const finalTotal = total + shipping;


  /* ------------------------------ */
  /* Empty Cart                     */
  /* ------------------------------ */

  if (cart.length === 0) {

    return (

      <div className="min-h-screen bg-background">

        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="flex items-center justify-center min-h-96">

            <div className="text-center">

              <ShoppingBag
                size={64}
                className="text-muted-foreground mx-auto mb-4 opacity-50"
              />

              <h2 className="heading-sm text-foreground mb-4">
                Your Cart is Empty
              </h2>

              <p className="text-muted-foreground mb-8 max-w-md">
                Add some beautiful products to your cart and come back to complete your purchase.
              </p>

              <Link
                to="/category/kanha-ji-dresses"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all active:scale-95"
              >
                Continue Shopping
              </Link>

            </div>

          </div>

        </div>

      </div>

    );

  }


  /* ------------------------------ */
  /* Main Cart UI                   */
  /* ------------------------------ */

  return (

    <div className="min-h-screen bg-background">

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">

        {/* Header */}

        <div className="mb-8 md:mb-12">

          <Link
            to="/category/kanha-ji-dresses"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>

          <h1 className="heading-md text-foreground">
            Shopping Cart
          </h1>

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


          {/* ------------------------------ */}
          {/* Cart Items                     */}
          {/* ------------------------------ */}

          <div className="lg:col-span-2">

            <div className="bg-white rounded-lg border border-border overflow-hidden">

              <div className="border-b border-border p-6 bg-secondary/50">

                <h2 className="font-semibold text-foreground text-lg">
                  {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                </h2>

              </div>


              <div className="divide-y divide-border">

                {cart.map((item) => (

                  <div
                    key={item.id}
                    className="p-4 sm:p-6 flex gap-3 sm:gap-4 flex-col sm:flex-row hover:bg-secondary/30 transition-colors"
                  >

                    {/* Product Image */}

                    <Link to={`/product/${item.id}`} className="flex-shrink-0">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg hover:shadow-md transition-shadow"
                      />

                    </Link>


                    {/* Product Info */}

                    <div className="flex-1">

                      <Link
                        to={`/product/${item.id}`}
                        className="font-serif text-lg font-semibold text-foreground hover:text-primary transition-colors block mb-2"
                      >
                        {item.name}
                      </Link>

                      <p className="text-sm text-muted-foreground mb-4">
                        SKU: {item.category}
                      </p>


                      {/* Quantity Controls */}

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="w-10 h-10 border border-border rounded hover:bg-secondary transition-colors flex items-center justify-center"
                        >
                          −
                        </button>

                        <span className="w-10 text-center font-medium text-foreground">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-10 h-10 border border-border rounded hover:bg-secondary transition-colors flex items-center justify-center"
                        >
                          +
                        </button>

                      </div>

                    </div>


                    {/* Price + Remove */}

                    <div className="flex flex-col items-end justify-between">

                      <div className="text-right">

                        <p className="text-primary font-bold text-lg">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          ₹{item.price.toLocaleString()} each
                        </p>

                      </div>


                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>



          {/* ------------------------------ */}
          {/* Order Summary                  */}
          {/* ------------------------------ */}

          <div className="lg:col-span-1">

            <div className="bg-white rounded-lg border border-border p-6 h-fit sticky top-24">

              <h2 className="font-semibold text-foreground text-lg mb-6">
                Order Summary
              </h2>


              {/* Coupon */}

              <div className="mb-6 pb-6 border-b border-border">

                <label className="block text-sm font-medium text-foreground mb-2">
                  Coupon Code
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  />

                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm"
                  >
                    Apply
                  </button>

                </div>

                {discount > 0 && (

                  <p className="text-sm text-green-600 mt-2">
                    Discount applied: ₹{discount.toLocaleString()}
                  </p>

                )}

              </div>


              {/* Pricing */}

              <div className="space-y-3 mb-6">

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {discount > 0 && (

                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>

                )}

                <div className="flex justify-between text-sm">

                  <span className="text-muted-foreground">
                    Shipping {subtotal > 500 ? "(Free)" : ""}
                  </span>

                  <span className="text-foreground font-medium">

                    {subtotal > 500 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shipping}`
                    )}

                  </span>

                </div>

                {subtotal <= 500 && (

                  <p className="text-xs text-muted-foreground">
                    Free shipping on orders over ₹500
                  </p>

                )}

              </div>


              {/* Total */}

              <div className="pt-6 border-t border-border mb-6">

                <div className="flex justify-between items-center">

                  <span className="font-semibold text-foreground text-lg">
                    Total
                  </span>

                  <span className="font-bold text-primary text-2xl">
                    ₹{finalTotal.toLocaleString()}
                  </span>

                </div>

              </div>


              {/* Checkout */}

              <Link
                to="/checkout"
                className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 text-center mb-3"
              >
                Proceed to Checkout
              </Link>


              {/* Continue Shopping */}

              <Link
                to="/category/kanha-ji-dresses"
                className="block w-full py-3 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-all text-center"
              >
                Continue Shopping
              </Link>


              {/* Features */}

              <div className="mt-6 pt-6 border-t border-border space-y-3 text-xs text-muted-foreground">

                <div className="flex gap-2">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  <span>Secure checkout</span>
                </div>

                <div className="flex gap-2">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  <span>Free returns within 14 days</span>
                </div>

                <div className="flex gap-2">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  <span>100% genuine products</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}