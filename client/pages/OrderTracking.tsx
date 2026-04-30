import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { API_URL } from "@/lib/api";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  XCircle,
} from "lucide-react";

interface OrderProduct {
  productId: { _id: string; name: string; price: number; image: string };
  quantity: number;
  name: string;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  products: OrderProduct[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentId: string;
  createdAt: string;
}

const statusConfig: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  pending: {
    label: "Order Placed",
    icon: Clock,
    color: "text-amber-600",
  },
  confirmed: {
    label: "Order Confirmed",
    icon: CheckCircle,
    color: "text-blue-600",
  },
  shipped: {
    label: "Shipped",
    icon: Package,
    color: "text-purple-600",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: Truck,
    color: "text-orange-600",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-red-600",
  },
};

const statusSteps = [
  "pending",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString("en-IN")}`;
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [orderTab, setOrderTab] = useState("active");

  const tabFilters: Record<string, string[]> = {
    active: ["pending", "confirmed", "shipped", "out_for_delivery"],
    delivered: ["delivered"],
    cancelled: ["cancelled"],
  };

  useEffect(() => {
    const email = localStorage.getItem("customerEmail");
    if (!email) {
      navigate("/login");
      return;
    }

    fetchOrders(email);
    const interval = setInterval(() => fetchOrders(email), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orders.length > 0 && orderId) {
      const found = orders.find((o) => o._id === orderId);
      if (found) setSelectedOrder(found);
    }
  }, [orders, orderId]);

  const fetchOrders = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/my?email=${email}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
        if (!selectedOrder && data.length > 0 && !orderId) {
          setSelectedOrder(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    const email = localStorage.getItem("customerEmail");
    if (!email) return;

    try {
      const res = await fetch(`${API_URL}/orders/cancel/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Order cancelled successfully");
        const updatedOrders = orders.map((o) =>
          o._id === orderId ? { ...o, status: "cancelled" } : o,
        );
        setOrders(updatedOrders);
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: "cancelled" });
        }
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch {
      alert("Error cancelling order");
    }
  };

  const copyOrderId = () => {
    if (selectedOrder) {
      navigator.clipboard.writeText(selectedOrder._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStepIndex = (status: string) => {
    return statusSteps.indexOf(status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-40 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Orders Found
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/category/kanha-ji-dresses"
            className="inline-block px-8 py-3 bg-[#c9a87c] text-white rounded-xl font-medium"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(selectedOrder.status);
  const StatusIcon = statusConfig[selectedOrder.status]?.icon || Clock;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Auto-refreshing</span>
        </div>

        {/* Order Tabs */}
        {orders.length > 1 && (
          <div className="flex gap-2 mb-6">
            {Object.entries(tabFilters).map(([key, statuses]) => {
              const count = orders.filter((o) =>
                statuses.includes(o.status),
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setOrderTab(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                    orderTab === key
                      ? "bg-[#c9a87c] text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {key} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Order List */}
        {orders.length > 1 && (
          <div className="space-y-2 mb-6">
            {orders
              .filter((o) => tabFilters[orderTab].includes(o.status))
              .map((o) => {
                const OrderIcon = statusConfig[o.status]?.icon || Clock;
                return (
                  <button
                    key={o._id}
                    onClick={() => {
                      setSelectedOrder(o);
                      navigate(`/my-orders/${o._id}`);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${
                      selectedOrder?._id === o._id
                        ? "border-[#c9a87c] bg-[#c9a87c]/5"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          o.status === "delivered"
                            ? "bg-green-100"
                            : o.status === "cancelled"
                              ? "bg-red-100"
                              : "bg-[#c9a87c]/10"
                        }`}
                      >
                        <OrderIcon
                          size={18}
                          className={statusConfig[o.status]?.color}
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-gray-900">
                          {statusConfig[o.status]?.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          #{o._id.slice(-8).toUpperCase()} •{" "}
                          {formatPrice(o.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                );
              })}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/my-orders")}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">Order ID:</span>
              <span className="text-sm font-mono text-gray-700">
                {selectedOrder._id.slice(-8).toUpperCase()}
              </span>
              <button
                onClick={copyOrderId}
                className="p-1 hover:bg-white rounded transition"
              >
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`rounded-2xl p-6 mb-6 ${
            selectedOrder.status === "cancelled"
              ? "bg-red-50 border border-red-200"
              : selectedOrder.status === "delivered"
                ? "bg-green-50 border border-green-200"
                : "bg-white border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                selectedOrder.status === "cancelled"
                  ? "bg-red-100"
                  : selectedOrder.status === "delivered"
                    ? "bg-green-100"
                    : "bg-[#c9a87c]/10"
              }`}
            >
              <StatusIcon
                size={28}
                className={
                  selectedOrder.status === "cancelled"
                    ? "text-red-600"
                    : selectedOrder.status === "delivered"
                      ? "text-green-600"
                      : "text-[#c9a87c]"
                }
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {statusConfig[selectedOrder.status]?.label || "Processing"}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedOrder.status === "pending" &&
                  "Your order is being processed"}
                {selectedOrder.status === "confirmed" &&
                  "Seller has confirmed your order"}
                {selectedOrder.status === "shipped" &&
                  "Your order is on the way"}
                {selectedOrder.status === "out_for_delivery" &&
                  "Order will be delivered today"}
                {selectedOrder.status === "delivered" &&
                  "Order delivered successfully"}
                {selectedOrder.status === "cancelled" &&
                  "This order has been cancelled"}
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Order Button */}
        {selectedOrder.status === "pending" && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <XCircle size={20} className="text-red-500" />
              <h3 className="font-semibold text-gray-900">Cancel Order</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              You can cancel this order before it is confirmed by the seller.
            </p>
            <button
              onClick={() => cancelOrder(selectedOrder._id)}
              className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
            >
              <XCircle size={16} />
              Cancel This Order
            </button>
          </div>
        )}

        {/* Progress Steps */}
        {selectedOrder.status !== "cancelled" && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-6">Order Progress</h3>

            <div className="relative">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-200" />
              <div
                className="absolute left-5 top-2 w-0.5 bg-green-500 transition-all duration-500"
                style={{
                  height: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                }}
              />

              <div className="space-y-6 relative">
                {statusSteps.map((step, index) => {
                  const StepIcon = statusConfig[step].icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step} className="flex items-start gap-4 relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-all ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
                      >
                        <StepIcon size={18} />
                      </div>
                      <div className="pt-2">
                        <p
                          className={`font-medium ${
                            isCompleted ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {statusConfig[step].label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-[#c9a87c]">
                            {index === 0 && "Order placed successfully"}
                            {index === 1 && "Seller confirmed"}
                            {index === 2 && "Dispatched from warehouse"}
                            {index === 3 && "Delivery partner on the way"}
                            {index === 4 && "Delivered to your address"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            Items in Order ({selectedOrder.products.length})
          </h3>

          <div className="space-y-4">
            {selectedOrder.products.map((product, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={
                      product.image ||
                      product.productId?.image ||
                      "https://via.placeholder.com/80?text=No+Image"
                    }
                    alt={product.name || product.productId?.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {product.name || product.productId?.name || "Product"}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Qty: {product.quantity}
                  </p>
                  <p className="font-bold text-[#c9a87c] mt-1">
                    {formatPrice(
                      product.price || product.productId?.price || 0,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Delivery Details</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-900">
                  {selectedOrder.customerName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrder.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={20} className="text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{selectedOrder.phone}</p>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{selectedOrder.email}</p>
            </div>
          </div>
        </div>

        {/* Payment & Summary */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            Payment & Summary
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-2">
                <CreditCard size={16} />
                Payment Method
              </span>
              <span className="font-medium">
                {selectedOrder.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </span>
            </div>

            {selectedOrder.paymentId && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Payment ID</span>
                <span className="font-mono text-xs">
                  {selectedOrder.paymentId}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Order Date</span>
              <span className="font-medium">
                {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-[#c9a87c]">
                {formatPrice(selectedOrder.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-gradient-to-r from-[#c9a87c] to-[#e8c4a0] rounded-2xl p-6 text-white text-center">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-white/80 text-sm mb-4">
            Contact us for any queries about your order
          </p>
          <div className="flex items-center justify-center gap-2">
            <Phone size={16} />
            <span className="font-medium">+91 85179 98877</span>
          </div>
        </div>
      </div>
    </div>
  );
}
