import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { CheckCircle, Download, Home } from "lucide-react";

interface Order {
  id: string;
  paymentId: string;
  amount: number;
  items: any[];
  customer: any;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

export default function OrderSuccess() {

  const { orderId } = useParams();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {

    if (orderId) {

      const savedOrder = localStorage.getItem(`order-${orderId}`);

      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }

    }

  }, [orderId]);



  const downloadInvoice = () => {

    if (!order) return;

    let content = `
╔════════════════════════════════════╗
║   SBC by Shweta - Order Invoice    ║
╚════════════════════════════════════╝

Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

─── CUSTOMER DETAILS ───
Name: ${order.customer.firstName} ${order.customer.lastName}
Email: ${order.customer.email}
Phone: ${order.customer.phone}
Address: ${order.customer.address}
City: ${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}

─── ORDER ITEMS ───
${order.items
  .map(
    (item) =>
      `${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`
  )
  .join("\n")}

─── PRICING ───
Subtotal: ₹${order.items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toLocaleString()}
Shipping: Free
Total: ₹${order.amount.toLocaleString()}

Payment Method: ${
      order.paymentMethod === "cod"
        ? "Cash on Delivery"
        : "Online Payment"
    }

${order.paymentId ? `Payment ID: ${order.paymentId}` : ""}

Thank you for shopping at SBC by Shweta!
`;

    const element = document.createElement("a");

    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );

    element.setAttribute("download", `invoice-${order.id}.txt`);

    element.style.display = "none";

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

  };



  if (!order) {

    return (

      <div className="min-h-screen bg-background">

        <Header />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">

          <p className="text-lg text-muted-foreground">
            Order not found
          </p>

          <Link
            to="/"
            className="inline-block mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all"
          >
            Go to Home
          </Link>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-background">

      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="bg-white rounded-lg border border-border p-8 md:p-12 text-center mb-8">

          <div className="mb-6">
            <CheckCircle size={64} className="text-green-600 mx-auto animate-bounce" />
          </div>

          <h1 className="heading-md text-foreground mb-3">
            Order Confirmed!
          </h1>

          <p className="text-lg text-muted-foreground mb-2">
            Thank you for your purchase
          </p>

          <p className="text-sm text-muted-foreground mb-6">
            Your order has been successfully placed. You will receive a confirmation email shortly.
          </p>

          <div className="bg-secondary/50 rounded-lg p-4 mb-6">

            <p className="text-xs text-muted-foreground mb-1">
              ORDER ID
            </p>

            <p className="font-mono font-bold text-lg text-foreground break-all">
              {order.id}
            </p>

          </div>


          <div className="grid grid-cols-2 gap-4 mb-8">

            <div className="bg-secondary/30 rounded-lg p-4">

              <p className="text-xs text-muted-foreground mb-1">
                Status
              </p>

              <p className="font-semibold text-foreground capitalize">
                {order.status}
              </p>

            </div>

            <div className="bg-secondary/30 rounded-lg p-4">

              <p className="text-xs text-muted-foreground mb-1">
                Total Amount
              </p>

              <p className="font-semibold text-primary text-xl">
                ₹{order.amount.toLocaleString()}
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-3 mb-8">

            <button
              onClick={downloadInvoice}
              className="flex-1 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Invoice
            </button>

            <Link
              to="/dashboard"
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95"
            >
              View Orders
            </Link>

          </div>


          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">

            <p className="text-sm font-semibold text-blue-900 mb-2">
              Payment Method
            </p>

            <p className="text-sm text-blue-800">
              {order.paymentMethod === "cod"
                ? "Cash on Delivery - You will pay when the order arrives"
                : "Online Payment - Your payment has been processed successfully"}
            </p>

            {order.paymentId && (

              <p className="text-xs text-blue-700 mt-2">
                Payment ID: {order.paymentId}
              </p>

            )}

          </div>


          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">

            <p className="text-sm font-semibold text-green-900 mb-3">
              Delivery Address
            </p>

            <p className="text-sm text-green-800 leading-relaxed">

              {order.customer.firstName} {order.customer.lastName}
              <br />
              {order.customer.address}
              <br />
              {order.customer.city}, {order.customer.state} {order.customer.zipCode}
              <br />
              {order.customer.country}
              <br /><br />

              <span className="font-semibold">Phone:</span> {order.customer.phone}
              <br />

              <span className="font-semibold">Email:</span> {order.customer.email}

            </p>

          </div>

        </div>



        <div className="bg-white rounded-lg border border-border p-6 md:p-8">

          <h2 className="font-semibold text-lg text-foreground mb-6">
            Order Items
          </h2>

          <div className="space-y-4 mb-6">

            {order.items.map((item, index) => (

              <div key={index} className="flex justify-between pb-4 border-b border-border last:border-b-0">

                <div>

                  <p className="font-medium text-foreground">
                    {item.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>

                </div>

                <p className="font-semibold text-foreground">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>

              </div>

            ))}

          </div>


          <div className="space-y-3 pt-6 border-t border-border">

            <div className="flex justify-between text-sm">

              <span className="text-muted-foreground">
                Subtotal
              </span>

              <span className="text-foreground font-medium">
                ₹{order.items
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-muted-foreground">
                Shipping
              </span>

              <span className="text-green-600 font-medium">
                Free
              </span>

            </div>

            <div className="flex justify-between pt-3 border-t border-border">

              <span className="font-semibold text-foreground">
                Total
              </span>

              <span className="font-bold text-primary text-xl">
                ₹{order.amount.toLocaleString()}
              </span>

            </div>

          </div>

        </div>


        <div className="mt-8 text-center">

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all active:scale-95"
          >
            <Home size={18} />
            Continue Shopping
          </Link>

        </div>

      </div>

    </div>

  );

}
