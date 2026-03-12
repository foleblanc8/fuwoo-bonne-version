// src/components/Header.tsx

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bell, Leaf } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const navLinks = [
    { to: "/", label: "Accueil" },
    { to: "/services", label: "Services" },
    { to: "/a-propos", label: "À propos" },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* ── Header principal : glassmorphism ── */}
      <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
              Fuwoo
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600 items-center">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative py-1 hover:text-coupdemain-primary transition-colors ${
                  location.pathname === to
                    ? "text-coupdemain-primary font-semibold"
                    : ""
                }`}
              >
                {label}
                {location.pathname === to && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-green-600 to-teal-500" />
                )}
              </Link>
            ))}

            {user ? (
              <div className="ml-4 flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-coupdemain-primary transition font-medium text-sm"
                >
                  {user.first_name || user.username}
                </Link>
                <Link to="/dashboard" className="relative" aria-label="Notifications">
                  <Bell className="w-5 h-5 text-gray-500 hover:text-coupdemain-primary transition" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-600 py-1.5 px-3.5 rounded-xl text-sm hover:bg-gray-200 transition"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="ml-4 flex items-center gap-3">
                <Link
                  to="/connexion"
                  className="text-gray-600 hover:text-coupdemain-primary text-sm font-medium transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 px-5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:from-green-700 hover:to-teal-700 transition-all"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </nav>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* ── Drawer mobile ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-xl z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
              Fuwoo
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4 text-gray-700">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-green-50 hover:text-coupdemain-primary transition-colors ${
                location.pathname === to
                  ? "bg-green-50 text-coupdemain-primary font-semibold"
                  : ""
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="my-3 border-t border-gray-100" />

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-green-50 hover:text-coupdemain-primary transition-colors"
              >
                Mon tableau de bord
              </Link>
              <button
                onClick={handleLogout}
                className="mt-1 text-left py-2.5 px-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                to="/connexion"
                onClick={() => setIsOpen(false)}
                className="text-center py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                onClick={() => setIsOpen(false)}
                className="text-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm font-semibold shadow-sm hover:from-green-700 hover:to-teal-700 transition-all"
              >
                S'inscrire gratuitement
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Header;
