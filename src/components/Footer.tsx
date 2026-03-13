import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t py-8 text-sm text-gray-500">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {year} Coupdemain. Tous droits réservés.</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to="/conditions-utilisation" className="hover:text-emerald-600 transition-colors">
            Conditions d'utilisation
          </Link>
          <Link to="/politique-confidentialite" className="hover:text-emerald-600 transition-colors">
            Confidentialité
          </Link>
          <Link to="/politique-remboursement" className="hover:text-emerald-600 transition-colors">
            Remboursement
          </Link>
          <Link to="/mentions-legales" className="hover:text-emerald-600 transition-colors">
            Mentions légales
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
