// src/pages/Connexion.tsx

import { useState } from "react";
import SEO from "../components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { Leaf, ArrowRight } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";

const Connexion = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate("/dashboard");
      } catch {
        setError("Connexion Google échouée. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Connexion Google annulée ou refusée."),
  });

  return (
    <div className="min-h-screen flex">
      <SEO title="Connexion" url="/connexion" noIndex />

      {/* ── Panneau gauche : gradient ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-green-950 via-green-900 to-teal-900 relative overflow-hidden flex-col justify-between p-14">
        {/* Orbes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-emerald-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">Fuwoo</span>
        </div>

        {/* Contenu central */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Des pros de confiance,
            <br />
            <span className="text-green-300">près de chez vous.</span>
          </h2>
          <p className="text-green-200/70 text-lg mb-10">
            Plomberie, ménage, déneigement et plus — partout au Québec.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "500+", label: "Prestataires" },
              { value: "2 min", label: "Pour réserver" },
              { value: "4.9★", label: "Note moyenne" },
            ].map((s) => (
              <div key={s.label} className="bg-white/8 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-white text-xl font-bold">{s.value}</p>
                <p className="text-green-300/70 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bas de page */}
        <p className="relative z-10 text-green-400/50 text-xs">
          © 2026 Fuwoo — Tous droits réservés
        </p>
      </div>

      {/* ── Panneau droit : formulaire ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
              Fuwoo
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bon retour !</h1>
          <p className="text-gray-500 text-sm mb-8">
            Connectez-vous à votre compte Fuwoo.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Nom d'utilisateur ou adresse courriel
              </label>
              <input
                type="text"
                placeholder="marie_tremblay"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-400 transition bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-600">Mot de passe</label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs text-coupdemain-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-400 transition bg-gray-50 focus:bg-white"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span className="shrink-0">⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold text-sm shadow-sm hover:from-green-700 hover:to-teal-700 hover:shadow-md transition-all disabled:opacity-60"
            >
              {loading ? "Connexion…" : (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center my-6 gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs font-medium">ou continuer avec</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleGoogleLogin()}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 py-3 rounded-xl text-sm font-medium shadow-sm hover:shadow-md hover:border-gray-300 transition disabled:opacity-60"
            >
              <FcGoogle size={20} />
              Google
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled
                className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-sm font-medium opacity-35 cursor-not-allowed"
              >
                <FaApple size={18} />
                Apple
              </button>
              <button
                disabled
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium opacity-35 cursor-not-allowed"
              >
                <FaFacebookF size={18} />
                Facebook
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-coupdemain-primary font-semibold hover:underline">
              S'inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
