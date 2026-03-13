// src/pages/Home.tsx
import { Link } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";
import { Search, Star, ShieldCheck, Clock, ArrowRight, MapPin } from "lucide-react";

const popularServices = [
  { id: 1,  title: "Plomberie résidentielle", categorySlug: "plomberie",           serviceArea: "Montréal",      rating: 4.9,  totalBookings: 54 },
  { id: 3,  title: "Ménage résidentiel",       categorySlug: "menage-residentiel",  serviceArea: "Laval",         rating: 4.8,  totalBookings: 98 },
  { id: 6,  title: "Tonte de pelouse",         categorySlug: "tonte-pelouse",       serviceArea: "Longueuil",     rating: 4.7,  totalBookings: 72 },
  { id: 7,  title: "Déneigement",              categorySlug: "deneigement",         serviceArea: "Rive-Sud",      rating: 4.6,  totalBookings: 88 },
  { id: 9,  title: "Entretien de piscine",     categorySlug: "entretien-piscine",   serviceArea: "Rive-Sud",      rating: 4.9,  totalBookings: 18 },
  { id: 8,  title: "Nettoyage de terrain",     categorySlug: "nettoyage-terrain",   serviceArea: "Grand Montréal",rating: 4.8,  totalBookings: 29 },
  { id: 2,  title: "Électricité",              categorySlug: "electricite",         serviceArea: "Montréal",      rating: 4.85, totalBookings: 33 },
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
        {/* Gradient overlay : vert profond → transparence */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/80 via-green-900/60 to-teal-900/50" />

        {/* Orbes décoratifs */}
        <div className="absolute top-16 right-1/4 w-72 h-72 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-48 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-green-100 mb-6">
            <MapPin className="w-3.5 h-3.5" />
            Services locaux au Québec
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Des pros pour votre maison,
            <br />
            <span className="bg-gradient-to-r from-green-300 to-teal-300 bg-clip-text text-transparent">
              à portée de clic.
            </span>
          </h1>
          <p className="mt-5 text-xl text-white/75 max-w-xl mx-auto">
            Plomberie, ménage, déneigement, piscine et plus — partout au Québec.
          </p>

          {/* Barre de recherche glassmorphism */}
          <div className="mt-10 max-w-xl mx-auto bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-1.5 flex items-center gap-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Quel service cherchez-vous ?"
                className="flex-1 text-gray-900 placeholder-gray-400 focus:outline-none text-sm bg-transparent"
              />
            </div>
            <Link
              to="/services"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-green-600 hover:to-teal-600 transition-all shadow-sm shrink-0"
            >
              Rechercher
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats inline */}
          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-white/60">
            <span><strong className="text-white font-semibold">500+</strong> prestataires</span>
            <span className="text-white/30">•</span>
            <span><strong className="text-white font-semibold">4.9★</strong> note moyenne</span>
            <span className="text-white/30">•</span>
            <span><strong className="text-white font-semibold">2 min</strong> pour réserver</span>
          </div>
        </div>
      </div>

      {/* ── Catégories rapides ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to="/services"
              className="flex flex-col items-center gap-2 min-w-[76px] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl group-hover:border-green-300 group-hover:bg-gradient-to-br group-hover:from-green-50 group-hover:to-teal-50 transition-all shadow-sm group-hover:shadow-md">
                {cat.emoji}
              </div>
              <span className="text-xs text-gray-500 font-medium text-center group-hover:text-coupdemain-primary transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Services populaires ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Services populaires</h2>
            <p className="text-gray-500 text-sm mt-0.5">Les services les mieux notés au Québec</p>
          </div>
          <Link
            to="/services"
            className="flex items-center gap-1.5 text-coupdemain-primary text-sm font-semibold hover:gap-2.5 transition-all"
          >
            Tout voir <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popularServices.map((s) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              categorySlug={s.categorySlug}
              rating={s.rating}
              totalBookings={s.totalBookings}
              serviceArea={s.serviceArea}
              linkTo={`/service/${s.id}`}
            />
          ))}
        </div>
      </div>

      {/* ── Pourquoi Fuwoo ── */}
      <div className="relative bg-gradient-to-br from-green-950 via-green-900 to-teal-900 py-20 overflow-hidden">
        {/* Orbes décoratifs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-green-200 mb-5">
            ✦ Pourquoi Fuwoo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            La façon intelligente de trouver
            <br />
            <span className="text-green-300">des pros de confiance</span>
          </h2>
          <p className="text-green-200/70 mb-14 max-w-lg mx-auto">
            Chaque prestataire est vérifié, chaque avis est authentique.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6 text-white" />,
                title: "Professionnels vérifiés",
                desc: "Chaque prestataire est identifié et évalué par la communauté Fuwoo.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: <Clock className="w-6 h-6 text-white" />,
                title: "Réservation en 2 minutes",
                desc: "Choisissez votre créneau, confirmez — le pro arrive chez vous.",
                gradient: "from-teal-500 to-cyan-500",
              },
              {
                icon: <Star className="w-6 h-6 text-white fill-white" />,
                title: "Avis 100 % transparents",
                desc: "Lisez les vrais avis de vrais clients avant de réserver.",
                gradient: "from-emerald-500 to-teal-500",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center gap-4 p-7 bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/12 transition-colors group"
              >
                <div className={`w-13 h-13 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center p-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                <p className="text-green-200/70 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 bg-white text-green-800 font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-green-50 transition-all text-sm"
            >
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 border border-white/25 text-white font-medium px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              Explorer les services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
