import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import logo from "../assets/light_logo.jpg";
import paymentBg from "../assets/payment.jpg";

export default function Footer() {
  return (
    <footer
      className="relative text-white"
      style={{
        backgroundImage: `url(${paymentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      <div className="relative max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
            100% Secure Payments
          </h2>
          <p className="text-white/70 text-sm">
            Your transactions are fully encrypted and secure
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="text-white/50 text-xs self-center mr-2">
            We Accept:
          </span>
          {["Visa", "Mastercard", "UPI", "COD"].map((m) => (
            <span
              key={m}
              className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded text-xs font-medium"
            >
              {m}
            </span>
          ))}
        </div>

        <div className="border-t border-white/20 pt-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <Link to="/" className="inline-block mb-2">
                <img src={logo} alt="SBC by Shwetaa" className="h-10 w-auto" />
              </Link>
              <p className="text-white/60 text-xs leading-relaxed max-w-xs">
                Where devotion meets culture — handcrafted divine fashion that
                celebrates every sacred moment with grace, elegance, and
                timeless beauty.
              </p>
              <div className="flex gap-2 mt-3 justify-center md:justify-start">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition"
                >
                  <Facebook size={14} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition"
                >
                  <Instagram size={14} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition"
                >
                  <Twitter size={14} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition"
                >
                  <Youtube size={14} />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#d4af37] mb-2">
                Quick Links
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/category/kanha-ji-dresses"
                    className="text-white/60 hover:text-[#d4af37] transition text-xs"
                  >
                    Kanha Ji Dresses
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/sarees"
                    className="text-white/60 hover:text-[#d4af37] transition text-xs"
                  >
                    Sarees
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/other-products"
                    className="text-white/60 hover:text-[#d4af37] transition text-xs"
                  >
                    Special Collections
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#d4af37] mb-2">
                Contact
              </h3>
              <ul className="space-y-2">
                <li className="text-white/60 text-xs flex items-start gap-2 justify-center md:justify-start">
                  <User
                    size={14}
                    className="flex-shrink-0 mt-0.5 text-[#d4af37]"
                  />
                  <span>Shweta Rathi</span>
                </li>
                <li className="text-white/60 text-xs flex items-start gap-2 justify-center md:justify-start">
                  <Phone
                    size={14}
                    className="flex-shrink-0 mt-0.5 text-[#d4af37]"
                  />
                  <span>+91 85179 98877</span>
                </li>
                <li className="text-white/60 text-xs flex items-start gap-2 justify-center md:justify-start">
                  <Mail
                    size={14}
                    className="flex-shrink-0 mt-0.5 text-[#d4af37]"
                  />
                  <span>contact@sbcbyshwetaa.com</span>
                </li>
                <li className="text-white/60 text-xs flex items-start gap-2 justify-center md:justify-start">
                  <MapPin
                    size={14}
                    className="flex-shrink-0 mt-0.5 text-[#d4af37]"
                  />
                  <span>Nanda Nagar, Indore, Madhya Pradesh, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 pt-4">
          <p className="text-center text-white/40 text-xs">
            © 2026 SBC by Shwetaa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
