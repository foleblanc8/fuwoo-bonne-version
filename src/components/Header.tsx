// src/components/Header.tsx

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bell } from "lucide-react";
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
      <header className="w-full sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-extrabold text-coupdemain-primary tracking-tight">
            Coupdemain
          </div>
          <nav className="hidden md:flex gap-10 text-base font-medium text-gray-700 items-center">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`hover:text-coupdemain-primary transition ${
                  location.pathname === to ? "text-coupdemain-primary font-bold" : ""
                }`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <div className="ml-6 flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-coupdemain-primary transition font-medium"
                >
                  Bonjour, {user.username}
                </Link>
                <Link to="/dashboard" className="relative" aria-label="Notifications">
                  <Bell className="w-5 h-5 text-gray-600 hover:text-coupdemain-primary transition" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl shadow hover:shadow-md transition hover:bg-gray-200"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                to="/connexion"
                className="ml-6 bg-coupdemain-primary text-white py-2 px-4 rounded-xl shadow hover:shadow-md transition"
              >
                Connexion
              </Link>
            )}
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 flex justify-between items-center border-b">
            <span className="text-xl font-bold text-coupdemain-primary">Menu</span>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <nav className="flex flex-col gap-4 p-4 text-gray-700">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`py-2 px-2 rounded hover:bg-coupdemain-primary/10 ${
                  location.pathname === to
                    ? "bg-coupdemain-primary/10 font-bold text-coupdemain-primary"
                    : ""
                }`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="py-2 px-2 rounded hover:bg-coupdemain-primary/10"
                >
                  Mon tableau de bord
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl shadow hover:shadow-md transition text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/connexion"
                onClick={() => setIsOpen(false)}
                className="mt-4 bg-coupdemain-primary text-white py-2 px-4 rounded-xl shadow hover:shadow-md transition text-center"
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
