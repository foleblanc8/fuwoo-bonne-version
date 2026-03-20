// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <SEO title="Page introuvable" noIndex />
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-gray-100 select-none">404</p>
        <h1 className="text-2xl font-bold text-gray-900 -mt-4 mb-3">Page introuvable</h1>
        <p className="text-gray-500 mb-8">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-coupdemain-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <Link
            to="/services"
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            <Search className="w-4 h-4" />
            Voir les services
          </Link>
        </div>
      </div>
    </div>
  );
}
