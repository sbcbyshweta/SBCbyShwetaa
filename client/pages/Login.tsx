import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Eye, EyeOff } from "lucide-react";
import { API_URL } from "@/lib/api";

import loginBg from "@/assets/login.jpg";
import logo from "@/assets/dark_logo.jpg";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Name is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      alert("Account created! Please login.");
      setIsLogin(true);
      setFormData({ ...formData, password: "", confirmPassword: "" });
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user?.email) {
        localStorage.setItem("customerEmail", data.user.email);
      }

      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      window.location.reload();
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <Header />

      <div className="relative flex justify-end items-center min-h-[calc(100vh-80px)] px-4 md:px-10">
        <div className="w-full max-w-md">
          <div className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-8">
            <div className="flex justify-center mb-6">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="logo" className="h-20 object-contain" />
              </Link>
            </div>

            <div className="flex mb-6 border-b border-white/30">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-3 text-sm ${
                  isLogin
                    ? "border-b-2 border-white text-white font-medium"
                    : "text-white/60"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-3 text-sm ${
                  !isLogin
                    ? "border-b-2 border-white text-white font-medium"
                    : "text-white/60"
                }`}
              >
                Sign Up
              </button>
            </div>

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-white text-sm block mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 rounded-lg text-white placeholder-white/50"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-white text-sm block mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/30 rounded-lg text-white placeholder-white/50 pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-300 text-sm text-center bg-red-500/20 py-2 rounded">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#8b5e3c] to-[#c9a87c] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-white text-sm block mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 rounded-lg text-white placeholder-white/50"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-white text-sm block mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 rounded-lg text-white placeholder-white/50"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-white text-sm block mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 rounded-lg text-white placeholder-white/50"
                    placeholder="Create password"
                  />
                </div>

                <div>
                  <label className="text-white text-sm block mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 rounded-lg text-white placeholder-white/50"
                    placeholder="Confirm password"
                  />
                </div>

                {error && (
                  <p className="text-red-300 text-sm text-center bg-red-500/20 py-2 rounded">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#8b5e3c] to-[#c9a87c] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
