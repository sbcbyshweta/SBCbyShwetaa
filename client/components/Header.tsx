import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, LogOut, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import logo from "../assets/light_logo.jpg";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const { cart } = useCart();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
    setTimeout(() => window.location.reload(), 100);
  };

  const navLinkClass =
    "relative font-medium text-sm px-2 py-1 transition-colors";

  const activeClass =
    "text-black after:absolute after:left-0 after:bottom-[-8px] after:h-[2px] after:w-full after:bg-gradient-to-r after:from-yellow-500 after:to-yellow-300";

  return (
    <header className="bg-gradient-to-r from-[#fff8ef] via-[#fcf6ed] to-[#f4e8d8] backdrop-blur-sm border-b border-[#e6dccf] sticky top-0 z-50 shadow-md">
      {/* silk gloss overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/10 to-white/40 opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="company logo"
              className="h-20 w-auto object-contain"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? activeClass : "text-gray-700"}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/category/kanha-ji-dresses"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? activeClass : "text-gray-700"}`
              }
            >
              Kanha Ji Dress
            </NavLink>

            <NavLink
              to="/category/sarees"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? activeClass : "text-gray-700"}`
              }
            >
              Saree
            </NavLink>

            <NavLink
              to="/category/other-products"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? activeClass : "text-gray-700"}`
              }
            >
              Special Collections
            </NavLink>
          </nav>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3">
            {/* CART (only after login) */}
            {isLoggedIn && (
              <Link
                to="/cart"
                className="relative p-2 hover:bg-white/40 rounded-full transition"
              >
                <ShoppingCart size={20} />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* MY ORDERS */}
            {isLoggedIn && (
              <Link
                to="/my-orders"
                className="p-2 hover:bg-white/40 rounded-full transition"
              >
                <Package size={20} />
              </Link>
            )}

            {/* LOGIN / LOGOUT */}
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-[#e6b980] text-[] bg-gradient-to-r from-[#b88746] via-[#f7d7a8] to-[#b88746] rounded-full font-semibold transition-all hover:shadow-xl hover:scale-105 uppercase tracking-wider text-sm"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm px-4 py-2 border border-gray-300 rounded hover:bg-white/50 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 border-t pt-4">
            <NavLink
              to="/"
              className="block px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/category/kanha-ji-dresses"
              className="block px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Kanha Ji Dress
            </NavLink>

            <NavLink
              to="/category/sarees"
              className="block px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Saree
            </NavLink>

            <NavLink
              to="/category/other-products"
              className="block px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Other Products
            </NavLink>

            {isLoggedIn && (
              <Link
                to="/cart"
                className="block px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart ({cartCount})
              </Link>
            )}

            {isLoggedIn && (
              <Link
                to="/my-orders"
                className="block px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Orders
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
