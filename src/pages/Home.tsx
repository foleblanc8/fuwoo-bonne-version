// src/pages/Home.tsx
import { Link } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";
import { Search, Star, ShieldCheck, Clock } from "lucide-react";

const popularServices = [
  { id: 1,  title: "Plomberie résidentielle", categorySlug: "plomberie",          serviceArea: "Montréal",     price: "85",  priceUnit: "par heure",  rating: 4.9,  totalBookings: 54 },
  { id: 3,  title: "Ménage résidentiel",       categorySlug: "menage-residentiel", serviceArea: "Laval",        price: "65",  priceUnit: "par visite", rating: 4.8,  totalBookings: 98 },
  { id: 6,  title: "Tonte de pelouse",         categorySlug: "tonte-pelouse",      serviceArea: "Longueuil",    price: "55",  priceUnit: "par visite", rating: 4.7,  totalBookings: 72 },
  { id: 7,  title: "Déneigement",              categorySlug: "deneigement",        serviceArea: "Rive-Sud",     price: "45",  priceUnit: "par visite", rating: 4.6,  totalBookings: 88 },
  { id: 9,  title: "Entretien de piscine",     categorySlug: "entretien-piscine",  serviceArea: "Rive-Sud",     price: "180", priceUnit: "par visite", rating: 4.9,  totalBookings: 18 },
  { id: 14, title: "Aménagement paysager",     categorySlug: "amenagement-paysager",serviceArea: "Rive-Sud",   price: "500", priceUnit: "par projet", rating: 4.95, totalBookings: 8  },
  { id: 8,  title: "Nettoyage de terrain",     categorySlug: "nettoyage-terrain",  serviceArea: "Grand Montréal",price: "75", priceUnit: "par visite", rating: 4.8,  totalBookings: 29 },
  { id: 2,  title: "Électricité",              categorySlug: "electricite",        serviceArea: "Montréal",     price: "95",  priceUnit: "par heure",  rating: 4.85, totalBookings: 33 },
];

const categories = [
  { label: "Ménage",       slug: "menage-residentiel",  emoji: "🧹" },
  { label: "Pelouse",      slug: "tonte-pelouse",       emoji: "🌿" },
  { label: "Déneigement",  slug: "deneigement",         emoji: "❄️" },
  { label: "Piscine",      slug: "entretien-piscine",   emoji: "🏊" },
  { label: "Peinture",     slug: "peinture",            emoji: "🎨" },
  { label: "Plomberie",    slug: "plomberie",           emoji: "🔧" },
  { label: "Électricité",  slug: "electricite",         emoji: "⚡" },
  { label: "Paysager",     slug: "amenagement-paysager",emoji: "🌳" },
  { label: "Déménagement", slug: "demenagement",        emoji: "📦" },
];

const Home = () => {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center text-white">
          <h1 className="text-5xl font-extrabold leading-tight drop-shadow">
            Des pros pour votre maison,<br />à portée de clic.
          </h1>
          <p className="mt-4 text-xl text-white/85">
            Plomberie, ménage, déneigement, piscine et plus — au Québec.
          </p>

          {/* Barre de recherche */}
          <div className="mt-10 max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Quel service cherchez-vous ?"
              className="flex-1 py-3 px-2 text-gray-900 placeholder-gray-400 focus:outline-none text-base bg-transparent"
            />
            <Link
              to="/services"
              className="bg-fuwoo-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-fuwoo-primary/90 transition text-sm shrink-0"
            >
              Rechercher
            </Link>
          </div>
        </div>
      </div>

      {/* ── Catégories rapides ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to="/services"
              className="flex flex-col items-center gap-2 min-w-[72px] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl group-hover:border-fuwoo-primary group-hover:bg-fuwoo-primary/5 transition-all">
                {cat.emoji}
              </div>
              <span className="text-xs text-gray-600 font-medium text-center group-hover:text-fuwoo-primary transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Services populaires ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Services populaires</h2>
          <Link to="/services" className="text-fuwoo-primary text-sm font-medium hover:underline">
            Tout voir →
          </Link>
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popularServices.map((s) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              categorySlug={s.categorySlug}
              price={s.price}
              priceUnit={s.priceUnit}
              rating={s.rating}
              totalBookings={s.totalBookings}
              serviceArea={s.serviceArea}
              linkTo={`/service/${s.id}`}
            />
          ))}
        </div>
      </div>

      {/* ── Pourquoi Fuwoo ── */}
      <div className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Pourquoi Fuwoo ?</h2>
          <p className="text-gray-500 mb-12">Comme Airbnb, mais pour les services à domicile au Québec.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-fuwoo-primary/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-fuwoo-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Professionnels vérifiés</h3>
              <p className="text-gray-500 text-sm">Chaque prestataire est identifié et évalué par la communauté Fuwoo.</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-fuwoo-primary/10 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-fuwoo-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Réservation en 2 minutes</h3>
              <p className="text-gray-500 text-sm">Choisissez votre créneau, confirmez — le pro arrive chez vous.</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-fuwoo-primary/10 rounded-2xl flex items-center justify-center">
                <Star className="w-7 h-7 text-fuwoo-primary fill-fuwoo-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Avis 100 % transparents</h3>
              <p className="text-gray-500 text-sm">Lisez les vrais avis de vrais clients avant de réserver.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
