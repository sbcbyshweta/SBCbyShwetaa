import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AdminProvider } from "./context/AdminContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import AdminPanel from "./pages/AdminPanel";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <AdminProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              <div className="min-h-screen flex flex-col">
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />

                    <Route path="/login" element={<Login />} />

                    <Route
                      path="/category/:category"
                      element={<CategoryPage />}
                    />

                    <Route
                      path="/product/:productId"
                      element={<ProductPage />}
                    />

                    <Route path="/cart" element={<Cart />} />

                    <Route path="/checkout" element={<Checkout />} />

                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route
                      path="/order-success/:orderId"
                      element={<OrderSuccess />}
                    />

                    <Route path="/my-orders" element={<OrderTracking />} />

                    <Route
                      path="/my-orders/:orderId"
                      element={<OrderTracking />}
                    />

                    <Route path="/admin" element={<AdminPanel />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Footer />
                </BrowserRouter>
              </div>
            </TooltipProvider>
          </AdminProvider>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
