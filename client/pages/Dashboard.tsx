import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useWishlist } from "@/context/WishlistContext";
import {
  LogOut,
  Heart,
  MapPin,
  User,
  Package,
  Trash2,
  Plus,
  Edit2,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState("orders");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUser();
    fetchOrders();
    fetchAddresses();
  }, []);

  /* ---------------- FETCH USER ---------------- */

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FETCH ORDERS ---------------- */

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FETCH ADDRESSES ---------------- */

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- ADD ADDRESS ---------------- */

  const handleAddAddress = async () => {
    const newAddress = {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    };

    try {
      const res = await fetch(`${API_URL}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      const data = await res.json();

      setAddresses([...addresses, data]);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- DELETE ADDRESS ---------------- */

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetch(`${API_URL}/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}

        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="heading-md text-foreground">My Account</h1>

            <p className="text-muted-foreground">
              Welcome, {userData.firstName}!
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-accent/5">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md">
                  {userData.firstName.charAt(0)}
                  {userData.lastName.charAt(0)}
                </div>

                <p className="font-semibold text-foreground text-lg">
                  {userData.firstName} {userData.lastName}
                </p>

                <p className="text-sm text-muted-foreground">
                  {userData.email}
                </p>
              </div>

              <nav className="p-3 space-y-1">
                {[
                  { id: "orders", label: "My Orders", icon: Package },
                  { id: "wishlist", label: "Wishlist", icon: Heart },
                  { id: "addresses", label: "Addresses", icon: MapPin },
                  { id: "profile", label: "Profile", icon: User },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon size={18} />

                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}

          <div className="lg:col-span-3">
            {/* ORDERS */}

            {activeTab === "orders" && (
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="font-semibold text-lg text-foreground mb-6">
                  My Orders & Tracking
                </h2>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-semibold text-foreground text-base">
                              Order #{order._id.slice(-6)}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <span className="px-4 py-2 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            {order.status}
                          </span>
                        </div>

                        <div className="border-t border-border pt-4 flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {order.items.length} items
                            </p>

                            <p className="font-bold text-primary text-lg">
                              ₹{order.amount}
                            </p>
                          </div>

                          <Link
                            to={`/order-success/${order._id}`}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package
                      size={48}
                      className="text-muted-foreground mx-auto mb-4 opacity-50"
                    />

                    <p className="text-muted-foreground mb-4 text-base">
                      No orders yet
                    </p>

                    <Link
                      to="/category/kanha-ji-dresses"
                      className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist tab remains same */}
          </div>
        </div>
      </div>
    </div>
  );
}
