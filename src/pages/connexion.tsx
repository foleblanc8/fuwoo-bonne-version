// src/pages/Connexion.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const Connexion = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch {
      setError("Identifiants invalides. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-coupdemain-primary text-center">Connexion</h1>
      <p className="text-center text-gray-600 mt-2">Connectez-vous à votre compte Coupdemain.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-coupdemain-primary text-white py-3 rounded-xl shadow hover:shadow-md transition disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
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
        <Link to="/inscription" className="text-coupdemain-primary hover:underline">
          Inscrivez-vous
        </Link>
      </p>
    </div>
  );
};

export default Connexion;
