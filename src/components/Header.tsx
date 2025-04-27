// src/components/Header.tsx

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import LoginModal from "./LoginModal";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Accueil" },
    { to: "/services", label: "Services" },
    { to: "/a-propos", label: "À propos" },
  ];

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-extrabold text-fuwoo-primary tracking-tight">
            Fuwoo
          </div>
          <nav className="hidden md:flex gap-10 text-base font-medium text-gray-700 items-center">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`hover:text-fuwoo-primary transition ${
                  location.pathname === to ? "text-fuwoo-primary font-bold" : ""
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={() => setShowLogin(true)}
              className="ml-6 bg-fuwoo-primary text-white py-2 px-4 rounded-xl shadow hover:shadow-md transition"
            >
              Connexion
            </button>
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
            <span className="text-xl font-bold text-fuwoo-primary">Menu</span>
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
                className={`py-2 px-2 rounded hover:bg-fuwoo-primary/10 ${
                  location.pathname === to
                    ? "bg-fuwoo-primary/10 font-bold text-fuwoo-primary"
                    : ""
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowLogin(true);
              }}
              className="mt-4 bg-fuwoo-primary text-white py-2 px-4 rounded-xl shadow hover:shadow-md transition"
            >
              Connexion
            </button>
          </nav>
        </div>
      </header>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default Header;
