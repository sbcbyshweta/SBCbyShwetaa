import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Loader, Check } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_BASE = "https://sbc-backend-u2sm.onrender.com/api";

export default function Checkout() {

  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="text-center">

            <h2 className="heading-sm text-foreground mb-4">
              Cart is Empty
            </h2>

            <p className="text-muted-foreground mb-8">
              Please add items to your cart before checkout.
            </p>

            <Link
              to="/category/kanha-ji-dresses"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all"
            >
              Continue Shopping
            </Link>

          </div>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal > 500 ? 0 : 100;
  const total = subtotal + shipping;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {

    if (
      !formData.firstName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      alert("Please fill in all required fields");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  /* ---------------- CREATE ORDER IN BACKEND ---------------- */

  const createOrder = async (paymentId = "", method = "razorpay") => {

    try {

      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          amount: total,
          paymentId: paymentId,
          paymentMethod: method,
          customer: formData,
        }),
      });

      const data = await response.json();

      clearCart();

      navigate(`/order-success/${data.orderId || Date.now()}`);

    } catch (error) {

      console.error("Order creation failed", error);
      alert("Order creation failed");

    }
  };

  /* ---------------- RAZORPAY ---------------- */

  const initializeRazorpay = async () => {

    if (!validateForm()) return;

    setIsLoading(true);

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      handleRazorpayPayment();
    };

    script.onerror = () => {
      alert("Failed to load payment gateway");
      setIsLoading(false);
    };

    document.body.appendChild(script);
  };

  const handleRazorpayPayment = () => {

    const options = {

      key: "rzp_test_1DP5ibkZiHnrPh",

      amount: total * 100,

      currency: "INR",

      name: "SBC by Shweta",

      description: `Order from SBC by Shweta - ${cart.length} items`,

      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },

      theme: {
        color: "#8b6434",
      },

      handler: async (response: any) => {

        await createOrder(response.razorpay_payment_id, "razorpay");

      },

      modal: {
        ondismiss: () => {
          setIsLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.open();

    setIsLoading(false);
  };

  /* ---------------- COD ---------------- */

  const handleCOD = async () => {

    if (!validateForm()) return;

    await createOrder("", "cod");

  };

  return (

    <div className="min-h-screen bg-background">

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">

        {/* Header */}

        <div className="mb-8">

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back to Cart
          </Link>

          <h1 className="heading-md text-foreground">
            Checkout
          </h1>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORM SECTION */}

          <div className="lg:col-span-2">

            <div className="bg-white rounded-lg border border-border p-6 md:p-8">

              {/* Delivery Address */}

              <div className="mb-8">

                <h2 className="font-semibold text-lg text-foreground mb-6">
                  Delivery Address
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">

                  <div>

                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="mb-4">

                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />

                </div>

                {/* PHONE */}

                <div className="mb-4">

                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />

                </div>

                {/* ADDRESS */}

                <div className="mb-4">

                  <label className="block text-sm font-medium text-foreground mb-2">
                    Street Address *
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />

                </div>

                {/* CITY STATE */}

                <div className="grid grid-cols-2 gap-4 mb-4">

                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="px-4 py-3 border border-border rounded-lg"
                  />

                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="px-4 py-3 border border-border rounded-lg"
                  />

                </div>

                {/* ZIP */}

                <div className="grid grid-cols-2 gap-4">

                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="px-4 py-3 border border-border rounded-lg"
                  />

                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="px-4 py-3 border border-border rounded-lg"
                  >
                    <option>India</option>
                    <option>USA</option>
                    <option>UK</option>
                  </select>

                </div>

              </div>

              {/* PAYMENT */}

              <div className="pt-8 border-t border-border">

                <h2 className="font-semibold text-lg text-foreground mb-6">
                  Payment Method
                </h2>

                <div className="space-y-3 mb-6">

                  <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer">

                    <input
                      type="radio"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />

                    <span className="ml-4">
                      Online Payment (Razorpay)
                    </span>

                  </label>

                  <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer">

                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />

                    <span className="ml-4">
                      Cash on Delivery
                    </span>

                  </label>

                </div>

                <button
                  onClick={
                    paymentMethod === "razorpay"
                      ? initializeRazorpay
                      : handleCOD
                  }
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2"
                >

                  {isLoading && (
                    <Loader size={18} className="animate-spin" />
                  )}

                  {isLoading
                    ? "Processing..."
                    : paymentMethod === "razorpay"
                    ? "Pay Now"
                    : "Place Order"}

                </button>

              </div>

            </div>

          </div>

          {/* ORDER SUMMARY */}

          <div className="lg:col-span-1">

            <div className="bg-white rounded-lg border border-border p-6 sticky top-24">

              <h2 className="font-semibold text-foreground text-lg mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">

                {cart.map((item) => (

                  <div key={item.id} className="flex justify-between text-sm">

                    <div>

                      <p className="font-medium">
                        {item.name}
                      </p>

                      <p className="text-xs">
                        Qty: {item.quantity}
                      </p>

                    </div>

                    <p>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>

                  </div>

                ))}

              </div>

              <div className="flex justify-between font-semibold text-lg">

                <span>Total</span>

                <span>
                  ₹{total.toLocaleString()}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}