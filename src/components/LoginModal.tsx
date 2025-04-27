// src/components/LoginModal.tsx

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignup = () => {
    onClose(); // Fermer la modal
    navigate("/inscription"); // Rediriger vers inscription
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-center text-fuwoo-primary">Connexion</h2>
        <p className="text-center text-gray-600 mt-2">Connectez-vous à votre compte Fuwoo.</p>

        <form className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Adresse courriel"
            className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
          />
          <button
            type="submit"
            className="mt-2 bg-fuwoo-primary text-white py-3 rounded-xl shadow hover:shadow-md transition"
          >
            Se connecter
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-3 text-gray-500 text-sm">ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <div className="flex flex-col gap-4">
          <button className="flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 py-3 rounded-xl shadow hover:shadow-md transition">
            <FcGoogle size={24} />
            Continuer avec Google
          </button>
          <button className="flex items-center justify-center gap-3 bg-black text-white py-3 rounded-xl shadow hover:shadow-md transition">
            <FaApple size={24} />
            Continuer avec Apple
          </button>
          <button className="flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-xl shadow hover:shadow-md transition">
            <FaFacebookF size={24} />
            Continuer avec Facebook
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Pas de compte?{" "}
          <button onClick={handleSignup} className="text-fuwoo-primary hover:underline">
            Inscrivez-vous
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;

